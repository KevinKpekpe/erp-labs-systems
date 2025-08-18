<?php

namespace App\Http\Controllers\Api\Compagnies\Stock;

use App\Http\Controllers\Controller;
use App\Http\Requests\Compagnies\Stock\StockStoreRequest;
use App\Http\Requests\Compagnies\Stock\StockUpdateRequest;
use App\Http\Requests\Compagnies\Stock\StockLotStoreRequest;
use App\Http\Requests\Compagnies\Stock\StockConsumeRequest;
use App\Models\Article;
use App\Models\Stock;
use App\Models\StockLot;
use App\Models\StockMovement;
use App\Services\FifoStockService;
use App\Support\ApiResponse;
use App\Support\CodeGenerator;
use Illuminate\Support\Facades\DB;

class StockController extends Controller
{
	protected $fifoService;

	public function __construct(FifoStockService $fifoService)
	{
		$this->fifoService = $fifoService;
	}
	public function index()
	{
		$companyId = request()->user()->company_id;
		$q = request('q') ?? request('search');
		$perPage = (int) (request('per_page') ?? 15);
		$sort = request('sort', 'id');
		$dir = request('dir', 'asc') === 'desc' ? 'desc' : 'asc';

		$stocks = Stock::where('company_id', $companyId)
			->with(['article:id,nom_article'])
			->withCalculatedQuantity()
			->withExpiredLots()
			->withNearExpirationLots()
			->search($q)
			->orderBy($sort, $dir)
			->paginate($perPage);

		// Ajouter les informations calculées à chaque stock
		$stocks->getCollection()->transform(function ($stock) {
			$stock->quantite_actuelle_lots = $stock->quantite_actuelle_calculee;
			$stock->valeur_stock = $stock->valeur_stock;
			$stock->has_expired_lots = $stock->hasExpiredLots();
			$stock->has_near_expiration_lots = $stock->hasNearExpirationLots();
			return $stock;
		});

		return ApiResponse::success($stocks, 'stock.stocks.list');
	}

	public function store(StockStoreRequest $request)
	{
		$companyId = $request->user()->company_id;
		$data = $request->validated();

		$article = Article::where('company_id', $companyId)->findOrFail($data['article_id']);

		// Nouveau système FIFO : le stock est créé SANS quantité initiale
		// La quantité sera gérée via les lots uniquement
		$stock = Stock::create([
			'company_id' => $companyId,
			'code' => CodeGenerator::generate('stocks', $companyId, 'STK'),
			'article_id' => $article->id,
			'quantite_actuelle' => 0, // Toujours 0, calculé via les lots
			'seuil_critique' => $data['seuil_critique'],
			'date_expiration' => $data['date_expiration'] ?? null,
		]);

		// Si une quantité initiale est fournie, créer un lot automatiquement
		if (isset($data['quantite_actuelle']) && $data['quantite_actuelle'] > 0) {
			$lotData = [
				'article_id' => $article->id,
				'quantite_initiale' => $data['quantite_actuelle'],
				'date_entree' => now()->format('Y-m-d'),
				'date_expiration' => $data['date_expiration'] ?? null,
				'prix_unitaire_achat' => $data['prix_unitaire_achat'] ?? $article->prix_unitaire,
				'numero_lot' => 'INITIAL-' . time(),
				'fournisseur_lot' => $data['fournisseur'] ?? $article->fournisseur,
				'commentaire' => 'Lot initial créé automatiquement lors de la création du stock',
			];

			$this->fifoService->processStockEntry($stock, $lotData);
		}

		return ApiResponse::success($stock->fresh(), 'stock.stocks.created', [], 201);
	}

	public function show(Stock $stock)
	{
		$this->authorizeStock($stock);
		$stock->load(['article:id,nom_article']);

		// Ajouter les informations détaillées
		$overview = $this->fifoService->getStockLotsOverview($stock);
		$stock->lots_overview = $overview;
		$stock->quantite_actuelle_lots = $stock->quantite_actuelle_calculee;
		$stock->valeur_stock = $stock->valeur_stock;

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
		if (array_key_exists('date_expiration', $data)) {
			$payload['date_expiration'] = $data['date_expiration'];
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

	public function addStockLot(StockLotStoreRequest $request, Stock $stock)
	{
		$this->authorizeStock($stock);
		$data = $request->validated();

		// Vérifier que l'article correspond
		if ($data['article_id'] !== $stock->article_id) {
			return ApiResponse::error('L\'article du lot doit correspondre à l\'article du stock', 422, 'ARTICLE_MISMATCH');
		}

		$lot = $this->fifoService->processStockEntry($stock, $data);

		return ApiResponse::success(
			$lot->load(['article:id,nom_article', 'movements']),
			'stock.lots.created',
			[],
			201
		);
	}

	public function consumeStock(StockConsumeRequest $request, Stock $stock)
	{
		$this->authorizeStock($stock);
		$data = $request->validated();

		try {
			$movements = collect();
			$methode = $data['methode_sortie'] ?? 'fifo';

			switch ($methode) {
				case 'fifo':
					$movements = $this->fifoService->processFifoExit($stock, $data['quantite'], $data);
					break;
				case 'fefo':
					$movements = $this->fifoService->processFefoExit($stock, $data['quantite'], $data);
					break;
				case 'manual':
					$movements = $this->fifoService->processManualExit($stock, $data['lots_manuels'], $data);
					break;
				default:
					return ApiResponse::error('Méthode de sortie non supportée', 422, 'INVALID_METHOD');
			}

			// Charger les relations pour chaque mouvement de la collection
			$movements->each(function ($movement) {
				$movement->load(['stockLot:id,code,numero_lot', 'stock:id,article_id', 'stock.article:id,nom_article']);
			});

			return ApiResponse::success([
				'movements' => $movements,
				'stock_updated' => $stock->fresh()->load(['article:id,nom_article']),
				'total_consumed' => $movements->sum('quantite'),
				'method_used' => $methode
			], 'stock.stocks.consumed');

		} catch (\InvalidArgumentException $e) {
			return ApiResponse::error($e->getMessage(), 422, 'CONSUMPTION_ERROR');
		}
	}

	public function stockLots(Stock $stock)
	{
		$this->authorizeStock($stock);
		$companyId = request()->user()->company_id;
		$perPage = (int) (request('per_page') ?? 15);

		$lots = StockLot::forCompany($companyId)
			->forArticle($stock->article_id)
			->with(['movements' => function($query) {
				$query->latest()->limit(5);
			}])
			->orderBy('date_entree', 'desc')
			->paginate($perPage);

		return ApiResponse::success($lots, 'stock.lots.list');
	}

	public function availableLots(Stock $stock)
	{
		$this->authorizeStock($stock);
		$companyId = request()->user()->company_id;

		$lots = StockLot::forCompany($companyId)
			->forArticle($stock->article_id)
			->available()
			->orderBy('date_entree', 'asc')
			->get();

		return ApiResponse::success([
			'lots' => $lots,
			'total_available' => $lots->sum('quantite_restante'),
			'fifo_order' => $lots->values(),
			'fefo_order' => $lots->sortBy('date_expiration')->values(),
		], 'stock.lots.available');
	}

	public function lotDetails($stockId, $lotId)
	{
		$companyId = request()->user()->company_id;
		$stock = Stock::where('company_id', $companyId)->findOrFail($stockId);
		$this->authorizeStock($stock);

		$lot = StockLot::forCompany($companyId)
			->with(['movements', 'article:id,nom_article'])
			->findOrFail($lotId);

		if ($lot->article_id !== $stock->article_id) {
			return ApiResponse::error('Ce lot n\'appartient pas à cet article', 403, 'LOT_MISMATCH');
		}

		return ApiResponse::success($lot, 'stock.lots.details');
	}

	private function authorizeStock(Stock $stock): void
	{
		if ($stock->company_id !== request()->user()->company_id) {
			abort(403);
		}
	}
}


