<?php

namespace App\Http\Controllers\Api\Compagnies\Exams;

use App\Http\Controllers\Controller;
use App\Http\Requests\Compagnies\Exams\ExamStoreRequest;
use App\Http\Requests\Compagnies\Exams\ExamUpdateRequest;
use App\Models\Article;
use App\Models\Exam;
use App\Support\ApiResponse;
use App\Support\CodeGenerator;
use Illuminate\Support\Facades\DB;

class ExamController extends Controller
{
    public function index()
    {
        $companyId = request()->user()->company_id;
        $q = request('q') ?? request('search');
        $perPage = (int) (request('per_page') ?? 15);
        $exams = Exam::where('company_id', $companyId)
            ->search($q)
            ->orderBy('nom_examen')
            ->paginate($perPage);
        return ApiResponse::success($exams, 'exams.list');
    }

    public function store(ExamStoreRequest $request)
    {
        $companyId = $request->user()->company_id;
        $data = $request->validated();

        $exam = DB::transaction(function () use ($companyId, $data) {
            $exam = Exam::create([
                'company_id' => $companyId,
                'code' => CodeGenerator::generate('examens', $companyId, 'EXM'),
                'nom_examen' => $data['nom_examen'],
                'description' => $data['description'] ?? '',
                'prix' => $data['prix'],
                'delai_rendu_estime' => $data['delai_rendu_estime'],
                'unites_mesure' => $data['unites_mesure'],
                'valeurs_reference' => $data['valeurs_reference'] ?? '',
                'type_echantillon' => $data['type_echantillon'],
                'conditions_pre_analytiques' => $data['conditions_pre_analytiques'] ?? '',
                'equipement_reactifs_necessaires' => $data['equipement_reactifs_necessaires'] ?? null,
            ]);

            if (!empty($data['articles'])) {
                $pivot = [];
                foreach ($data['articles'] as $item) {
                    // Validation de cohérence multi-tenant via existence de l'article
                    $article = Article::where('company_id', $companyId)->findOrFail($item['article_id']);
                    $pivot[$article->id] = ['quantite_utilisee' => (float) $item['quantite_utilisee']];
                }
                if ($pivot) {
                    $exam->articles()->sync($pivot);
                }
            }

            return $exam->fresh();
        });

        return ApiResponse::success($exam, 'exams.created', [], 201);
    }

    public function show(Exam $exam)
    {
        $this->authorizeExam($exam);
        $exam->load(['articles:id,nom_article']);
        return ApiResponse::success($exam, 'exams.details');
    }

    public function update(ExamUpdateRequest $request, Exam $exam)
    {
        $this->authorizeExam($exam);
        $data = $request->validated();

        DB::transaction(function () use ($exam, $data) {
            $payload = [];
            foreach ([
                'nom_examen','description','prix','delai_rendu_estime','unites_mesure',
                'valeurs_reference','type_echantillon','conditions_pre_analytiques','equipement_reactifs_necessaires'
            ] as $f) {
                if (array_key_exists($f, $data)) { $payload[$f] = $data[$f]; }
            }
            if ($payload) { $exam->update($payload); }

            if (array_key_exists('articles', $data)) {
                $pivot = [];
                if (!empty($data['articles'])) {
                    foreach ($data['articles'] as $item) {
                        $article = Article::where('company_id', $exam->company_id)->findOrFail($item['article_id']);
                        $pivot[$article->id] = ['quantite_utilisee' => (float) $item['quantite_utilisee']];
                    }
                }
                $exam->articles()->sync($pivot);
            }
        });

        return ApiResponse::success($exam->fresh()->load(['articles:id,nom_article']), 'exams.updated');
    }

    public function destroy(Exam $exam)
    {
        $this->authorizeExam($exam);
        $exam->delete();
        return ApiResponse::success(null, 'exams.deleted');
    }

    public function trashed()
    {
        $companyId = request()->user()->company_id;
        $q = request('q') ?? request('search');
        $perPage = (int) (request('per_page') ?? 15);
        $exams = Exam::onlyTrashed()->where('company_id', $companyId)
            ->search($q)->paginate($perPage);
        return ApiResponse::success($exams, 'exams.trashed');
    }

    public function restore($id)
    {
        $companyId = request()->user()->company_id;
        $exam = Exam::withTrashed()->where('company_id', $companyId)->findOrFail($id);
        $exam->restore();
        return ApiResponse::success($exam, 'exams.restored');
    }

    public function forceDelete($id)
    {
        $companyId = request()->user()->company_id;
        $exam = Exam::withTrashed()->where('company_id', $companyId)->findOrFail($id);
        $exam->forceDelete();
        return ApiResponse::success(null, 'exams.force_deleted');
    }

    private function authorizeExam(Exam $exam): void
    {
        if ($exam->company_id !== request()->user()->company_id) {
            abort(403);
        }
    }
}


