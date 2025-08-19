<?php

namespace App\Http\Controllers\Api\Compagnies\Stock;

use App\Http\Controllers\Controller;
use App\Http\Requests\Compagnies\Stock\MovementStoreRequest;
use App\Http\Requests\Compagnies\Stock\MovementUpdateRequest;
use App\Models\Stock;
use App\Models\StockMovement;
use App\Support\ApiResponse;
use App\Support\CodeGenerator;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class MovementController extends Controller
{
	public function index(Request $request)
	{
		$companyId = $request->user()->company_id;
		$q = $request->get('q') ?? $request->get('search');
		$perPage = (int) ($request->get('per_page') ?? 15);
		$sort = $request->get('sort', 'date_mouvement');
		$dir = $request->get('dir', 'desc') === 'asc' ? 'asc' : 'desc';

		// Filtres avancés
		$typeMouvement = $request->get('type_mouvement');
		$stockId = $request->get('stock_id');
		$lotId = $request->get('lot_id');
		$dateDebut = $request->get('date_debut');
		$dateFin = $request->get('date_fin');
		$demandeId = $request->get('demande_id');
		$trashed = $request->get('trashed', false);

		$query = StockMovement::where('company_id', $companyId);

		// Recherche textuelle
		if ($q) {
			$query->search($q);
		}

		// Application des filtres
		if ($typeMouvement) {
			$query->where('type_mouvement', $typeMouvement);
		}

		if ($stockId) {
			$query->where('stock_id', $stockId);
		}

		if ($lotId) {
			$query->where('stock_lot_id', $lotId);
		}

		if ($dateDebut) {
			$query->whereDate('date_mouvement', '>=', $dateDebut);
		}

		if ($dateFin) {
			$query->whereDate('date_mouvement', '<=', $dateFin);
		}

		if ($demandeId) {
			$query->where('demande_id', $demandeId);
		}

		// Gestion de la corbeille
		if ($trashed) {
			$query->onlyTrashed();
		}

		$movements = $query->with([
				'stock:id,article_id',
				'stock.article:id,nom_article',
				'stockLot:id,code,numero_lot,date_expiration'
			])
			->orderBy($sort, $dir)
			->paginate($perPage);

		return ApiResponse::success($movements, 'stock.movements.list');
	}

	public function show(StockMovement $movement)
	{
		$this->authorizeMovement($movement);

		$movement->load([
			'stock:id,article_id',
			'stock.article:id,nom_article',
			'stockLot:id,code,numero_lot,date_expiration'
		]);

		return ApiResponse::success($movement, 'stock.movements.details');
	}

	public function update(MovementUpdateRequest $request, StockMovement $movement)
	{
		$this->authorizeMovement($movement);
		$data = $request->validated();

		$payload = [];
		foreach (['quantite', 'motif', 'prix_unitaire_mouvement'] as $field) {
			if (array_key_exists($field, $data)) {
				$payload[$field] = $data[$field];
			}
		}

		if ($payload) {
			$movement->update($payload);
		}

		return ApiResponse::success($movement->fresh(), 'stock.movements.updated');
	}

	public function destroy(StockMovement $movement)
	{
		$this->authorizeMovement($movement);
		$movement->delete();
		return ApiResponse::success(null, 'stock.movements.deleted');
	}

	public function restore($id)
	{
		$companyId = request()->user()->company_id;
		$movement = StockMovement::onlyTrashed()
			->where('company_id', $companyId)
			->findOrFail($id);

		$movement->restore();
		return ApiResponse::success($movement, 'stock.movements.restored');
	}

	public function forceDelete($id)
	{
		$companyId = request()->user()->company_id;
		$movement = StockMovement::onlyTrashed()
			->where('company_id', $companyId)
			->findOrFail($id);

		$movement->forceDelete();
		return ApiResponse::success(null, 'stock.movements.force_deleted');
	}

	public function trashed()
	{
		$companyId = request()->user()->company_id;
		$q = request('q') ?? request('search');
		$perPage = (int) (request('per_page') ?? 15);

		$movements = StockMovement::onlyTrashed()
			->where('company_id', $companyId)
			->with([
				'stock:id,article_id',
				'stock.article:id,nom_article',
				'stockLot:id,code,numero_lot,date_expiration'
			])
			->search($q)
			->orderByDesc('deleted_at')
			->paginate($perPage);

		return ApiResponse::success($movements, 'stock.movements.trashed');
	}

	public function movementsByLot($lotId)
	{
		$companyId = request()->user()->company_id;
		$perPage = (int) (request('per_page') ?? 15);

		// Vérifier que le lot appartient à la compagnie
		$lot = \App\Models\StockLot::where('company_id', $companyId)
			->findOrFail($lotId);

		$movements = StockMovement::where('company_id', $companyId)
			->where('stock_lot_id', $lotId)
			->with([
				'stock:id,article_id',
				'stock.article:id,nom_article'
			])
			->orderByDesc('date_mouvement')
			->paginate($perPage);

		return ApiResponse::success($movements, 'stock.movements.by_lot');
	}

	public function movementsByArticle($articleId)
	{
		$companyId = request()->user()->company_id;
		$perPage = (int) (request('per_page') ?? 15);

		// Vérifier que l'article appartient à la compagnie
		$article = \App\Models\Article::where('company_id', $companyId)
			->findOrFail($articleId);

		$movements = StockMovement::where('company_id', $companyId)
			->whereHas('stock', function($query) use ($articleId) {
				$query->where('article_id', $articleId);
			})
			->with([
				'stock:id,article_id',
				'stock.article:id,nom_article',
				'stockLot:id,code,numero_lot,date_expiration'
			])
			->orderByDesc('date_mouvement')
			->paginate($perPage);

		return ApiResponse::success($movements, 'stock.movements.by_article');
	}

	/**
	 * Méthode dépréciée - redirige vers les nouvelles méthodes FIFO
	 */
	public function store(MovementStoreRequest $request)
	{
		return response()->json([
			'message' => 'Cette méthode est dépréciée. Utilisez les nouvelles méthodes FIFO via /stock/stocks/{stock}/consume',
			'code' => 'METHOD_DEPRECATED'
		], 410);
	}

	/**
	 * Vérifier l'autorisation sur le mouvement
	 */
	private function authorizeMovement(StockMovement $movement)
	{
		if ($movement->company_id !== request()->user()->company_id) {
			abort(403, 'Accès non autorisé à ce mouvement');
		}
	}
}


