<?php

namespace App\Http\Controllers\Api\Compagnies\Exams;

use App\Http\Controllers\Controller;
use App\Http\Requests\Compagnies\Exams\ExamRequestStoreRequest;
use App\Http\Requests\Compagnies\Exams\ExamRequestUpdateRequest;
use App\Http\Requests\Compagnies\Exams\ExamRequestFullUpdateRequest;
use App\Http\Requests\Compagnies\Exams\ExamRequestDetailUpdateRequest;
use App\Models\Doctor;
use App\Models\Exam;
use App\Models\ExamRequest;
use App\Models\ExamRequestDetail;
use App\Models\Patient;
use App\Models\Invoice;
use App\Models\Stock;
use App\Models\StockMovement;
use App\Models\StockLot;
use App\Support\StockAlertService;
use App\Support\ApiResponse;
use App\Support\CodeGenerator;
use Illuminate\Support\Facades\DB;
use App\Services\FifoStockService;

class ExamRequestController extends Controller
{
    public function __construct(private FifoStockService $fifoService) {}
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
        $statut = request('statut_demande');
        $patientName = request('patient_name');
        $doctorName = request('doctor_name');
        $dateDebut = request('date_debut');
        $dateFin = request('date_fin');
        $sort = request('sort', 'date_demande');
        $dir = request('dir', 'desc') === 'asc' ? 'asc' : 'desc';

        $query = ExamRequest::where('company_id', $companyId)
            ->with(['patient:id,nom,postnom,prenom','medecin:id,nom,prenom'])
            ->select(['*', 'medecin_prescripteur_externe_nom', 'medecin_prescripteur_externe_prenom']);

        if (!empty($q)) { $query->search($q); }
        if (!empty($statut)) { $query->where('statut_demande', $statut); }
        if (!empty($patientName)) {
            $query->whereHas('patient', function ($qp) use ($patientName) {
                $qp->where('nom', 'like', "%$patientName%");
                $qp->orWhere('postnom', 'like', "%$patientName%");
                $qp->orWhere('prenom', 'like', "%$patientName%");
            });
        }
        if (!empty($doctorName)) {
            $query->where(function ($qd) use ($doctorName) {
                $qd->whereHas('medecin', function ($qm) use ($doctorName) {
                    $qm->where('nom', 'like', "%$doctorName%")
                        ->orWhere('prenom', 'like', "%$doctorName%");
                })
                ->orWhere('medecin_prescripteur_externe_nom', 'like', "%$doctorName%")
                ->orWhere('medecin_prescripteur_externe_prenom', 'like', "%$doctorName%");
            });
        }
        if (!empty($dateDebut)) { $query->whereDate('date_demande', '>=', $dateDebut); }
        if (!empty($dateFin)) { $query->whereDate('date_demande', '<=', $dateFin); }

        $requests = $query->orderBy($sort, $dir)->paginate($perPage);
        return ApiResponse::success($requests, 'exam_requests.list');
    }

    public function byPatient(Patient $patient)
    {
        if ($patient->company_id !== request()->user()->company_id) { abort(403); }
        $companyId = $patient->company_id;
        $q = request('q') ?? request('search');
        $perPage = (int) (request('per_page') ?? 15);
        $requests = ExamRequest::where('company_id', $companyId)
            ->where('patient_id', $patient->id)
            ->with(['patient:id,nom,postnom,prenom','medecin:id,nom,prenom'])
            ->select(['*', 'medecin_prescripteur_externe_nom', 'medecin_prescripteur_externe_prenom'])
            ->search($q)
            ->orderByDesc('date_demande')
            ->paginate($perPage);
        return ApiResponse::success($requests, 'exam_requests.list');
    }

    public function byDoctor(Doctor $doctor)
    {
        if ($doctor->company_id !== request()->user()->company_id) { abort(403); }
        $companyId = $doctor->company_id;
        $q = request('q') ?? request('search');
        $perPage = (int) (request('per_page') ?? 15);
        $requests = ExamRequest::where('company_id', $companyId)
            ->where('medecin_prescripteur_id', $doctor->id)
            ->with(['patient:id,nom,postnom,prenom','medecin:id,nom,prenom'])
            ->select(['*', 'medecin_prescripteur_externe_nom', 'medecin_prescripteur_externe_prenom'])
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
        $examRequest->load([
            'patient:id,nom,postnom,prenom,sexe,date_naissance,contact,adresse',
            'medecin:id,nom,prenom',
            'details',
            'details.examen:id,code,nom_examen,unites_mesure,valeurs_reference,type_echantillon'
        ]);
        return ApiResponse::success($examRequest, 'exam_requests.details');
    }

    public function update(ExamRequestUpdateRequest $request, ExamRequest $examRequest)
    {
        $this->authorizeRequest($examRequest);
        $data = $request->validated();

        DB::transaction(function () use ($examRequest, $data) {
            // transitions de statut simples
            if (isset($data['statut_demande'])) {
                $current = $examRequest->statut_demande;
                $next = $data['statut_demande'];
                // Règles de transition: En attente -> En cours -> Terminée
                if ($next === 'En cours' && $current !== 'En attente') {
                    throw new \App\Exceptions\ApiException('exam_requests.invalid_transition', 422, 'INVALID_STATUS_TRANSITION');
                }
                if ($next === 'Terminée' && $current !== 'En cours') {
                    throw new \App\Exceptions\ApiException('exam_requests.invalid_transition', 422, 'INVALID_STATUS_TRANSITION');
                }

                // Consommation stock auto par lots lors du passage "En cours"
                if ($next === 'En cours') {
                    $companyId = $examRequest->company_id;
                    $details = $examRequest->details()->get(['examen_id']);
                    $examIds = $details->pluck('examen_id')->all();
                    $requiredByArticle = $this->computeRequiredArticles($companyId, $examIds);

                    // Éviter double-déduction
                    $existingMovements = StockMovement::where('company_id', $companyId)
                        ->where('demande_id', $examRequest->id)
                        ->count();
                    if ($existingMovements === 0) {
                        $methode = request('methode_sortie', 'fifo');
                        $options = [
                            'date_mouvement' => now(),
                            'motif' => 'Consommation pour demande '.$examRequest->code,
                            'demande_id' => $examRequest->id,
                        ];
                        foreach ($requiredByArticle as $articleId => $qty) {
                            $stock = Stock::where('company_id', $companyId)->where('article_id', $articleId)->first();
                            if (!$stock) {
                                throw new \App\Exceptions\ApiException('stock.not_found', 422, 'STOCK_NOT_FOUND');
                            }
                            if ($methode === 'fefo') {
                                $this->fifoService->processFefoExit($stock, (int) ceil($qty), $options);
                            } else {
                                $this->fifoService->processFifoExit($stock, (int) ceil($qty), $options);
                            }
                        }
                    }
                }

                // Passage à Terminée: exiger que tous les résultats soient saisis
                if ($next === 'Terminée') {
                    $missing = $examRequest->details()->whereNull('resultat')->count();
                    if ($missing > 0) {
                        throw new \App\Exceptions\ApiException('exam_requests.results_missing', 422, 'RESULTS_MISSING');
                    }
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

                // Finalement, appliquer le changement de statut
                $examRequest->update(['statut_demande' => $next]);
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
        // Annulation interdite si Terminée ou En cours
        if (in_array($examRequest->statut_demande, ['Terminée', 'En cours'], true)) {
            $msgKey = $examRequest->statut_demande === 'Terminée'
                ? 'exam_requests.cannot_cancel_finished'
                : 'exam_requests.cannot_cancel_in_progress';
            $code = $examRequest->statut_demande === 'Terminée' ? 'CANNOT_CANCEL' : 'CANNOT_CANCEL_IN_PROGRESS';
            return ApiResponse::error($msgKey, 422, $code);
        }
        $examRequest->update(['statut_demande' => 'Annulée']);
        $examRequest->delete();
        return ApiResponse::success(null, 'exam_requests.cancelled');
    }

    // Mise à jour complète (métadonnées et liste d'examens)
    public function fullUpdate(ExamRequestFullUpdateRequest $request, ExamRequest $examRequest)
    {
        $this->authorizeRequest($examRequest);
        $data = $request->validated();
        $companyId = $examRequest->company_id;

        return DB::transaction(function () use ($examRequest, $data, $companyId) {
            $payload = [];
            foreach (['date_demande','note'] as $f) {
                if (array_key_exists($f, $data)) { $payload[$f] = $data[$f]; }
            }

            if (array_key_exists('patient_id', $data)) {
                $patient = Patient::where('company_id', $companyId)->findOrFail($data['patient_id']);
                $payload['patient_id'] = $patient->id;
            }
            if (array_key_exists('medecin_prescripteur_id', $data)) {
                $medecinId = null;
                if (!empty($data['medecin_prescripteur_id'])) {
                    $medecinId = Doctor::where('company_id', $companyId)->findOrFail($data['medecin_prescripteur_id'])->id;
                }
                $payload['medecin_prescripteur_id'] = $medecinId;
            }
            if (array_key_exists('medecin_prescripteur_externe_nom', $data)) {
                $payload['medecin_prescripteur_externe_nom'] = $data['medecin_prescripteur_externe_nom'];
            }
            if (array_key_exists('medecin_prescripteur_externe_prenom', $data)) {
                $payload['medecin_prescripteur_externe_prenom'] = $data['medecin_prescripteur_externe_prenom'];
            }

            if (!empty($payload)) { $examRequest->update($payload); }

            if (array_key_exists('examens', $data)) {
                DB::table('demande_examen_details')
                    ->where('company_id', $companyId)
                    ->where('demande_id', $examRequest->id)
                    ->delete();

                $rows = [];
                foreach ($data['examens'] as $examId) {
                    $exam = Exam::where('company_id', $companyId)->findOrFail($examId);
                    $rows[] = [
                        'company_id' => $companyId,
                        'code' => CodeGenerator::generate('demande_examen_details', $companyId, 'RQD'),
                        'demande_id' => $examRequest->id,
                        'examen_id' => $exam->id,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ];
                }
                if (!empty($rows)) { DB::table('demande_examen_details')->insert($rows); }
            }

            return ApiResponse::success($examRequest->fresh()->load(['details','patient:id,nom,postnom,prenom','medecin:id,nom,prenom']), 'exam_requests.updated');
        });
    }

    // Mise à jour d'un détail (résultat)
    public function updateDetail(ExamRequestDetailUpdateRequest $request, ExamRequest $examRequest, ExamRequestDetail $detail)
    {
        $this->authorizeRequest($examRequest);
        if ($detail->demande_id !== $examRequest->id) { abort(404); }
        $data = $request->validated();
        // Si un résultat est fourni sans date, définir la date à maintenant pour éviter erreurs de format
        if (array_key_exists('resultat', $data) && (!array_key_exists('date_resultat', $data) || empty($data['date_resultat']))) {
            $data['date_resultat'] = now();
        }
        $detail->update($data);
        return ApiResponse::success($detail->fresh(), 'exam_requests.detail.updated');
    }

    // Suppression d'un détail
    public function destroyDetail(ExamRequest $examRequest, ExamRequestDetail $detail)
    {
        $this->authorizeRequest($examRequest);
        if ($detail->demande_id !== $examRequest->id) { abort(404); }
        $detail->delete();
        return ApiResponse::success(null, 'exam_requests.detail.deleted');
    }

    // Corbeille / restore / force delete pour les demandes
    public function trashed()
    {
        $companyId = request()->user()->company_id;
        $q = request('q') ?? request('search');
        $perPage = (int) (request('per_page') ?? 15);
        $requests = ExamRequest::onlyTrashed()->where('company_id', $companyId)
            ->search($q)
            ->orderByDesc('date_demande')
            ->paginate($perPage);
        return ApiResponse::success($requests, 'exam_requests.trashed');
    }

    public function restore($id)
    {
        $companyId = request()->user()->company_id;
        $req = ExamRequest::withTrashed()->where('company_id', $companyId)->findOrFail($id);
        $req->restore();
        return ApiResponse::success($req, 'exam_requests.restored');
    }

    public function forceDelete($id)
    {
        $companyId = request()->user()->company_id;
        $req = ExamRequest::withTrashed()->where('company_id', $companyId)->findOrFail($id);
        $req->forceDelete();
        return ApiResponse::success(null, 'exam_requests.force_deleted');
    }

    private function authorizeRequest(ExamRequest $examRequest): void
    {
        if ($examRequest->company_id !== request()->user()->company_id) {
            abort(403);
        }
    }
}


