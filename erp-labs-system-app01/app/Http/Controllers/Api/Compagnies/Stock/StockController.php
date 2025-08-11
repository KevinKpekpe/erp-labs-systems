<?php

namespace App\Http\Controllers\Api\Compagnies\Stock;

use App\Http\Controllers\Controller;
use App\Http\Requests\Compagnies\Stock\StockStoreRequest;
use App\Http\Requests\Compagnies\Stock\StockUpdateRequest;
use App\Models\Article;
use App\Models\Stock;
use App\Support\ApiResponse;
use App\Support\CodeGenerator;

class StockController extends Controller
{
    public function index()
    {
        $companyId = request()->user()->company_id;
        $q = request('q') ?? request('search');
        $perPage = (int) (request('per_page') ?? 15);
        $sort = request('sort', 'id');
        $dir = request('dir', 'asc') === 'desc' ? 'desc' : 'asc';

        $stocks = Stock::where('company_id', $companyId)
            ->with(['article:id,nom_article'])
            ->search($q)
            ->orderBy($sort, $dir)
            ->paginate($perPage);
        return ApiResponse::success($stocks, 'stock.stocks.list');
    }

    public function store(StockStoreRequest $request)
    {
        $companyId = $request->user()->company_id;
        $data = $request->validated();

        $article = Article::where('company_id', $companyId)->findOrFail($data['article_id']);

        $stock = Stock::create([
            'company_id' => $companyId,
            'code' => CodeGenerator::generate('stocks', $companyId, 'STK'),
            'article_id' => $article->id,
            'quantite_actuelle' => $data['quantite_actuelle'] ?? 0,
            'seuil_critique' => $data['seuil_critique'],
        ]);

        return ApiResponse::success($stock, 'stock.stocks.created', [], 201);
    }

    public function show(Stock $stock)
    {
        $this->authorizeStock($stock);
        $stock->load(['article:id,nom_article']);
        return ApiResponse::success($stock, 'stock.stocks.details');
    }

    public function update(StockUpdateRequest $request, Stock $stock)
    {
        $this->authorizeStock($stock);
        $data = $request->validated();
        $payload = [];
        if (array_key_exists('seuil_critique', $data)) {
            $payload['seuil_critique'] = $data['seuil_critique'];
        }
        if (array_key_exists('article_id', $data)) {
            $article = Article::where('company_id', $stock->company_id)->findOrFail($data['article_id']);
            $payload['article_id'] = $article->id;
        }
        if ($payload) { $stock->update($payload); }
        return ApiResponse::success($stock->fresh(), 'stock.stocks.updated');
    }

    public function destroy(Stock $stock)
    {
        $this->authorizeStock($stock);
        $stock->delete();
        return ApiResponse::success(null, 'stock.stocks.deleted');
    }

    public function trashed()
    {
        $companyId = request()->user()->company_id;
        $q = request('q') ?? request('search');
        $perPage = (int) (request('per_page') ?? 15);
        $stocks = Stock::onlyTrashed()->where('company_id', $companyId)
            ->search($q)
            ->paginate($perPage);
        return ApiResponse::success($stocks, 'stock.stocks.trashed');
    }

    public function restore($id)
    {
        $companyId = request()->user()->company_id;
        $stock = Stock::withTrashed()->where('company_id', $companyId)->findOrFail($id);
        $stock->restore();
        return ApiResponse::success($stock, 'stock.stocks.restored');
    }

    public function forceDelete($id)
    {
        $companyId = request()->user()->company_id;
        $stock = Stock::withTrashed()->where('company_id', $companyId)->findOrFail($id);
        $stock->forceDelete();
        return ApiResponse::success(null, 'stock.stocks.force_deleted');
    }

    private function authorizeStock(Stock $stock): void
    {
        if ($stock->company_id !== request()->user()->company_id) {
            abort(403);
        }
    }
}


