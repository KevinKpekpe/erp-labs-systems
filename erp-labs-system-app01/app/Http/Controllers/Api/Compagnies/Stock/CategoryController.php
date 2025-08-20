<?php

namespace App\Http\Controllers\Api\Compagnies\Stock;

use App\Http\Controllers\Controller;
use App\Http\Requests\Compagnies\Stock\CategoryStoreRequest;
use App\Http\Requests\Compagnies\Stock\CategoryUpdateRequest;
use App\Models\CategoryArticle;
use App\Support\ApiResponse;
use App\Support\CodeGenerator;

class CategoryController extends Controller
{
    public function index()
    {
        $companyId = request()->user()->company_id;
        $q = request('q') ?? request('search');
        $perPage = (int) (request('per_page') ?? 15);
        $sort = request('sort', 'nom_categorie');
        $dir = request('dir', 'asc') === 'desc' ? 'desc' : 'asc';

        $categories = CategoryArticle::where('company_id', $companyId)
            ->withCount(['articles as articles_count' => function ($q) use ($companyId) {
                $q->where('company_id', $companyId);
            }])
            ->search($q)
            ->orderBy($sort, $dir)
            ->paginate($perPage);

        return ApiResponse::success($categories, 'stock.categories.list');
    }

    public function store(CategoryStoreRequest $request)
    {
        $companyId = $request->user()->company_id;
        $data = $request->validated();

        $category = CategoryArticle::create([
            'company_id' => $companyId,
            'code' => CodeGenerator::generate('categorie_articles', $companyId, 'CAT'),
            'nom_categorie' => $data['nom_categorie'],
            'type_laboratoire' => $data['type_laboratoire'] ?? null,
            'conditions_stockage_requises' => $data['conditions_stockage_requises'] ?? null,
            'temperature_stockage_min' => $data['temperature_stockage_min'] ?? null,
            'temperature_stockage_max' => $data['temperature_stockage_max'] ?? null,
            'humidite_max' => $data['humidite_max'] ?? null,
            'sensible_lumiere' => $data['sensible_lumiere'] ?? false,
            'chaine_froid_critique' => $data['chaine_froid_critique'] ?? false,
            'delai_alerte_expiration' => $data['delai_alerte_expiration'] ?? 30,
        ]);

        return ApiResponse::success($category, 'stock.categories.created', [], 201);
    }

    public function show(CategoryArticle $category)
    {
        $this->authorizeCategory($category);
        return ApiResponse::success($category, 'stock.categories.details');
    }

    public function update(CategoryUpdateRequest $request, CategoryArticle $category)
    {
        $this->authorizeCategory($category);
        $data = $request->validated();

        $category->update([
            'nom_categorie' => $data['nom_categorie'],
            'type_laboratoire' => $data['type_laboratoire'] ?? null,
            'conditions_stockage_requises' => $data['conditions_stockage_requises'] ?? null,
            'temperature_stockage_min' => $data['temperature_stockage_min'] ?? null,
            'temperature_stockage_max' => $data['temperature_stockage_max'] ?? null,
            'humidite_max' => $data['humidite_max'] ?? null,
            'sensible_lumiere' => $data['sensible_lumiere'] ?? false,
            'chaine_froid_critique' => $data['chaine_froid_critique'] ?? false,
            'delai_alerte_expiration' => $data['delai_alerte_expiration'] ?? 30,
        ]);

        return ApiResponse::success($category->fresh(), 'stock.categories.updated');
    }

    public function destroy(CategoryArticle $category)
    {
        $this->authorizeCategory($category);
        $category->delete();
        return ApiResponse::success(null, 'stock.categories.deleted');
    }

    public function trashed()
    {
        $companyId = request()->user()->company_id;
        $q = request('q') ?? request('search');
        $perPage = (int) (request('per_page') ?? 15);
        $categories = CategoryArticle::onlyTrashed()
            ->where('company_id', $companyId)
            ->search($q)
            ->orderBy('nom_categorie')
            ->paginate($perPage);
        return ApiResponse::success($categories, 'stock.categories.trashed');
    }

    public function restore($id)
    {
        $companyId = request()->user()->company_id;
        $category = CategoryArticle::withTrashed()->where('company_id', $companyId)->findOrFail($id);
        $category->restore();
        return ApiResponse::success($category, 'stock.categories.restored');
    }

    public function forceDelete($id)
    {
        $companyId = request()->user()->company_id;
        $category = CategoryArticle::withTrashed()->where('company_id', $companyId)->findOrFail($id);
        $category->forceDelete();
        return ApiResponse::success(null, 'stock.categories.force_deleted');
    }

    private function authorizeCategory(CategoryArticle $category): void
    {
        if ($category->company_id !== request()->user()->company_id) {
            abort(403);
        }
    }
}


