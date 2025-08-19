<?php

namespace App\Http\Controllers\Api\Compagnies\Stock;

use App\Http\Controllers\Controller;
use App\Http\Requests\Compagnies\Stock\ArticleStoreRequest;
use App\Http\Requests\Compagnies\Stock\ArticleUpdateRequest;
use App\Models\Article;
use App\Models\CategoryArticle;
use App\Support\ApiResponse;
use App\Support\CodeGenerator;

class ArticleController extends Controller
{
    public function index()
    {
        $companyId = request()->user()->company_id;
        $q = request('q') ?? request('search');
        $perPage = (int) (request('per_page') ?? 15);
        $sort = request('sort', 'nom_article');
        $dir = request('dir', 'asc') === 'desc' ? 'desc' : 'asc';
        $categoryId = request('categorie_id') ?? request('category_id');

        $articles = Article::where('company_id', $companyId)
            ->when($categoryId, function ($query) use ($categoryId) {
                $query->where('categorie_id', $categoryId);
            })
            ->with(['category:id,nom_categorie'])
            ->search($q)
            ->orderBy($sort, $dir)
            ->paginate($perPage);

        return ApiResponse::success($articles, 'stock.articles.list');
    }

    public function store(ArticleStoreRequest $request)
    {
        $companyId = $request->user()->company_id;
        $data = $request->validated();

        // Vérifier que la catégorie appartient à la même compagnie (déjà validé, double sécurité)
        $category = CategoryArticle::where('company_id', $companyId)->findOrFail($data['categorie_id']);

        $article = Article::create([
            'company_id' => $companyId,
            'code' => CodeGenerator::generate('articles', $companyId, 'ART'),
            'categorie_id' => $category->id,
            'nom_article' => $data['nom_article'],
            'description' => $data['description'] ?? null,
            'fournisseur' => $data['fournisseur'] ?? null,
            'prix_unitaire' => $data['prix_unitaire'],
            'unite_mesure' => $data['unite_mesure'],
        ]);

        return ApiResponse::success($article, 'stock.articles.created', [], 201);
    }

    public function show(Article $article)
    {
        $this->authorizeArticle($article);
        $article->load(['category:id,nom_categorie']);
        return ApiResponse::success($article, 'stock.articles.details');
    }

    public function update(ArticleUpdateRequest $request, Article $article)
    {
        $this->authorizeArticle($article);
        $data = $request->validated();

        $payload = [];
        foreach (['nom_article','description','fournisseur','prix_unitaire','unite_mesure'] as $f) {
            if (array_key_exists($f, $data)) { $payload[$f] = $data[$f]; }
        }
        if (array_key_exists('categorie_id', $data)) {
            // Vérifier la catégorie dans la même compagnie
            $category = CategoryArticle::where('company_id', $article->company_id)->findOrFail($data['categorie_id']);
            $payload['categorie_id'] = $category->id;
        }
        if ($payload) { $article->update($payload); }

        return ApiResponse::success($article->fresh(), 'stock.articles.updated');
    }

    public function destroy(Article $article)
    {
        $this->authorizeArticle($article);
        $article->delete();
        return ApiResponse::success(null, 'stock.articles.deleted');
    }

    public function trashed()
    {
        $companyId = request()->user()->company_id;
        $q = request('q') ?? request('search');
        $perPage = (int) (request('per_page') ?? 15);
        $categoryId = request('categorie_id') ?? request('category_id');
        $articles = Article::onlyTrashed()
            ->where('company_id', $companyId)
            ->when($categoryId, function ($query) use ($categoryId) {
                $query->where('categorie_id', $categoryId);
            })
            ->search($q)
            ->orderBy('nom_article')
            ->paginate($perPage);
        return ApiResponse::success($articles, 'stock.articles.trashed');
    }

    public function restore($id)
    {
        $companyId = request()->user()->company_id;
        $article = Article::withTrashed()->where('company_id', $companyId)->findOrFail($id);
        $article->restore();
        return ApiResponse::success($article, 'stock.articles.restored');
    }

    public function forceDelete($id)
    {
        $companyId = request()->user()->company_id;
        $article = Article::withTrashed()->where('company_id', $companyId)->findOrFail($id);
        $article->forceDelete();
        return ApiResponse::success(null, 'stock.articles.force_deleted');
    }

    private function authorizeArticle(Article $article): void
    {
        if ($article->company_id !== request()->user()->company_id) {
            abort(403);
        }
    }
}


