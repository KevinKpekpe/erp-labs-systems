<?php

namespace App\Http\Controllers\Api\Compagnies\Exams;

use App\Http\Controllers\Controller;
use App\Http\Requests\Compagnies\Exams\ExamRequestStoreRequest;
use App\Http\Requests\Compagnies\Exams\ExamRequestUpdateRequest;
use App\Models\Doctor;
use App\Models\Exam;
use App\Models\ExamRequest;
use App\Models\ExamRequestDetail;
use App\Models\Patient;
use App\Models\Invoice;
use App\Models\Stock;
use App\Models\StockMovement;
use App\Support\StockAlertService;
use App\Support\ApiResponse;
use App\Support\CodeGenerator;
use Illuminate\Support\Facades\DB;

class ExamRequestController extends Controller
{
    private function computeRequiredArticles(int $companyId, array $examIds): array
    {
        if (empty($examIds)) { return []; }
        $rows = DB::table('examen_articles')
            ->where('company_id', $companyId)
            ->whereIn('examen_id', $examIds)
            ->select('article_id', DB::raw('SUM(quantite_utilisee) as qty'))
            ->groupBy('article_id')
            ->get();
        $map = [];
        foreach ($rows as $r) { $map[(int) $r->article_id] = (float) $r->qty; }
        return $map;
    }
    public function index()
    {
        $companyId = request()->user()->company_id;
        $q = request('q') ?? request('search');
        $perPage = (int) (request('per_page') ?? 15);
        $requests = ExamRequest::where('company_id', $companyId)
            ->with(['patient:id,nom,postnom,prenom','medecin:id,nom,prenom'])
            ->search($q)
            ->orderByDesc('date_demande')
            ->paginate($perPage);
        return ApiResponse::success($requests, 'exam_requests.list');
    }

    public function store(ExamRequestStoreRequest $request)
    {
        $companyId = $request->user()->company_id;
        $data = $request->validated();

        // 1) Vérifier la disponibilité du stock pour tous les examens demandés
        $requiredByArticle = $this->computeRequiredArticles($companyId, $data['examens']);
        if (!empty($requiredByArticle)) {
            $insufficient = [];
            foreach ($requiredByArticle as $articleId => $requiredQty) {
                $stock = Stock::where('company_id', $companyId)->where('article_id', $articleId)->first();
                $available = $stock?->quantite_actuelle ?? 0;
                if ($available < $requiredQty) {
                    $insufficient[] = [
                        'article_id' => $articleId,
                        'required' => $requiredQty,
                        'available' => $available,
                    ];
                }
            }
            if (!empty($insufficient)) {
                return ApiResponse::error('stock.insufficient', 422, 'STOCK_UNAVAILABLE', ['articles' => $insufficient]);
            }
        }

        $result = DB::transaction(function () use ($companyId, $data) {
            $patient = Patient::where('company_id', $companyId)->findOrFail($data['patient_id']);
            $medecinId = null;
            if (!empty($data['medecin_prescripteur_id'])) {
                $medecinId = Doctor::where('company_id', $companyId)->findOrFail($data['medecin_prescripteur_id'])->id;
            }

            $req = ExamRequest::create([
                'company_id' => $companyId,
                'code' => CodeGenerator::generate('demande_examens', $companyId, 'REQ'),
                'patient_id' => $patient->id,
                'medecin_prescripteur_id' => $medecinId,
                'medecin_prescripteur_externe_nom' => $data['medecin_prescripteur_externe_nom'] ?? null,
                'medecin_prescripteur_externe_prenom' => $data['medecin_prescripteur_externe_prenom'] ?? null,
                'date_demande' => $data['date_demande'] ?? now(),
                'statut_demande' => 'En attente',
                'note' => $data['note'] ?? null,
            ]);

            // Détails
            $rows = [];
            $montantTotal = 0.0;
            foreach ($data['examens'] as $examId) {
                $exam = Exam::where('company_id', $companyId)->findOrFail($examId);
                $rows[] = [
                    'company_id' => $companyId,
                    'code' => CodeGenerator::generate('demande_examen_details', $companyId, 'RQD'),
                    'demande_id' => $req->id,
                    'examen_id' => $exam->id,
                    'resultat' => null,
                    'date_resultat' => null,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
                $montantTotal += (float) $exam->prix;
            }
            if ($rows) { DB::table('demande_examen_details')->insert($rows); }

            return $req->fresh()->load(['details','patient:id,nom,postnom,prenom','medecin:id,nom,prenom']);
        });

        return ApiResponse::success($result, 'exam_requests.created', [], 201);
    }

    public function show(ExamRequest $examRequest)
    {
        $this->authorizeRequest($examRequest);
        $examRequest->load(['patient:id,nom,postnom,prenom','medecin:id,nom,prenom','details']);
        return ApiResponse::success($examRequest, 'exam_requests.details');
    }

    public function update(ExamRequestUpdateRequest $request, ExamRequest $examRequest)
    {
        $this->authorizeRequest($examRequest);
        $data = $request->validated();

        DB::transaction(function () use ($examRequest, $data) {
            // transitions de statut simples
            if (isset($data['statut_demande'])) {
                $examRequest->update(['statut_demande' => $data['statut_demande']]);
                // Consommation stock auto sur passage "En cours"
                if ($data['statut_demande'] === 'En cours') {
                    $companyId = $examRequest->company_id;
                    $details = $examRequest->details()->get(['examen_id']);
                    $examIds = $details->pluck('examen_id')->all();
                    $requiredByArticle = $this->computeRequiredArticles($companyId, $examIds);

                    // Verrouiller et vérifier
                    $articleIds = array_keys($requiredByArticle);
                    if (!empty($articleIds)) {
                        $stocks = Stock::where('company_id', $companyId)
                            ->whereIn('article_id', $articleIds)
                            ->lockForUpdate()
                            ->get()
                            ->keyBy('article_id');

                        $insufficient = [];
                        foreach ($requiredByArticle as $articleId => $requiredQty) {
                            $stock = $stocks->get($articleId);
                            $available = $stock?->quantite_actuelle ?? 0;
                            if ($available < $requiredQty) {
                                $insufficient[] = [
                                    'article_id' => $articleId,
                                    'required' => $requiredQty,
                                    'available' => $available,
                                ];
                            }
                        }
                        if (!empty($insufficient)) {
                            throw new \App\Exceptions\ApiException('stock.insufficient', 422, 'STOCK_UNAVAILABLE', ['articles' => $insufficient]);
                        }

                        // Éviter double-déduction: vérifier s'il existe déjà des mouvements pour cette demande
                        $existingMovements = StockMovement::where('company_id', $companyId)
                            ->where('demande_id', $examRequest->id)
                            ->count();
                        if ($existingMovements === 0) {
                            foreach ($requiredByArticle as $articleId => $qty) {
                                $stock = $stocks->get($articleId);
                                $stock->quantite_actuelle -= $qty;
                                $stock->save();

                                StockMovement::create([
                                    'company_id' => $companyId,
                                    'code' => CodeGenerator::generate('mouvement_stocks', $companyId, 'MOV'),
                                    'stock_id' => $stock->id,
                                    'date_mouvement' => now(),
                                    'quantite' => (int) ceil($qty),
                                    'type_mouvement' => 'Sortie',
                                    'demande_id' => $examRequest->id,
                                    'motif' => 'Consommation pour demande '.$examRequest->code,
                                ]);

                                // Alerte si seuil atteint
                                StockAlertService::evaluateAndCreate($stock);
                            }
                        }
                    }
                }
                if ($data['statut_demande'] === 'Terminée') {
                    // Générer facture automatique au moment de la terminaison
                    $companyId = $examRequest->company_id;
                    $patientId = $examRequest->patient_id;
                    $details = $examRequest->details()->with('examen:id,prix')->get();
                    $montantTotal = $details->sum(fn($d) => (float) ($d->examen->prix ?? 0));
                    if ($montantTotal > 0) {
                        $invoice = Invoice::firstOrCreate(
                            ['demande_id' => $examRequest->id],
                            [
                                'company_id' => $companyId,
                                'code' => CodeGenerator::generate('factures', $companyId, 'INV'),
                                'patient_id' => $patientId,
                                'date_facture' => now(),
                                'montant_total' => $montantTotal,
                                'statut_facture' => 'En attente de paiement',
                            ]
                        );

                        // Générer les facture_details
                        $existingDetails = DB::table('facture_details')
                            ->where('company_id', $companyId)
                            ->where('facture_id', $invoice->id)
                            ->count();
                        if ($existingDetails === 0) {
                            $rows = [];
                            foreach ($details as $d) {
                                $rows[] = [
                                    'company_id' => $companyId,
                                    'code' => CodeGenerator::generate('facture_details', $companyId, 'FD'),
                                    'facture_id' => $invoice->id,
                                    'examen_id' => $d->examen_id,
                                    'prix_unitaire_facture' => (float) ($d->examen->prix ?? 0),
                                    'created_at' => now(),
                                    'updated_at' => now(),
                                ];
                            }
                            if (!empty($rows)) {
                                DB::table('facture_details')->insert($rows);
                            }
                        }
                    }
                }
            }

            if (array_key_exists('note', $data)) {
                $examRequest->update(['note' => $data['note']]);
            }
        });

        return ApiResponse::success($examRequest->fresh(), 'exam_requests.updated');
    }

    public function destroy(ExamRequest $examRequest)
    {
        $this->authorizeRequest($examRequest);
        // Annulation autorisée si non Terminée
        if ($examRequest->statut_demande === 'Terminée') {
            return ApiResponse::error('exam_requests.cannot_cancel_finished', 422, 'CANNOT_CANCEL');
        }
        $examRequest->update(['statut_demande' => 'Annulée']);
        $examRequest->delete();
        return ApiResponse::success(null, 'exam_requests.cancelled');
    }

    private function authorizeRequest(ExamRequest $examRequest): void
    {
        if ($examRequest->company_id !== request()->user()->company_id) {
            abort(403);
        }
    }
}


