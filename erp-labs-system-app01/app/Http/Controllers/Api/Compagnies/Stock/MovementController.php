<?php

namespace App\Http\Controllers\Api\Compagnies\Stock;

use App\Http\Controllers\Controller;
use App\Http\Requests\Compagnies\Stock\MovementStoreRequest;
use App\Http\Requests\Compagnies\Stock\MovementUpdateRequest;
use App\Models\Stock;
use App\Models\StockMovement;
use App\Support\ApiResponse;
use App\Support\CodeGenerator;
use Illuminate\Support\Facades\DB;

class MovementController extends Controller
{
	public function index()
	{
		$companyId = request()->user()->company_id;
		$q = request('q') ?? request('search');
		$perPage = (int) (request('per_page') ?? 15);
		$sort = request('sort', 'date_mouvement');
		$dir = request('dir', 'desc') === 'asc' ? 'asc' : 'desc';

		$movements = StockMovement::where('company_id', $companyId)
			->with([
				'stock:id,article_id',
				'stock.article:id,nom_article',
				'stockLot:id,code,numero_lot,date_expiration'
			])
			->search($q)
			->orderBy($sort, $dir)
			->paginate($perPage);

		// Ajouter les informations calculées
		$movements->getCollection()->transform(function ($movement) {
			$movement->valeur_totale = $movement->valeur_totale;
			return $movement;
		});

		return ApiResponse::success($movements, 'stock.movements.list');
	}

	public function store(MovementStoreRequest $request)
	{
		// Note: Cette méthode est dépréciée en faveur de la nouvelle logique FIFO
		// Utilisez StockController@consumeStock ou StockController@addStockLot à la place
		return ApiResponse::error(
			'Cette méthode est dépréciée. Utilisez les nouvelles méthodes FIFO dans StockController.',
			410,
			'METHOD_DEPRECATED'
		);
	}

	public function update(MovementUpdateRequest $request, StockMovement $movement)
	{
		$this->authorizeMovement($movement);

		// Seuls les champs non critiques peuvent être modifiés
		// Les quantités et lots ne peuvent pas être modifiés pour préserver l'intégrité FIFO
		$data = $request->validated();
		$allowedFields = ['date_mouvement', 'motif'];
		$payload = [];

		foreach ($allowedFields as $field) {
			if (array_key_exists($field, $data)) {
				$payload[$field] = $data[$field];
			}
		}

		if ($payload) {
			$movement->update($payload);
		}

		return ApiResponse::success(
			$movement->fresh()->load(['stock:id,article_id','stock.article:id,nom_article', 'stockLot:id,code,numero_lot']),
			'stock.movements.updated'
		);
	}

	public function destroy(StockMovement $movement)
	{
		$this->authorizeMovement($movement);

		// La suppression de mouvements est désormais restreinte pour préserver l'intégrité FIFO
		// Seuls les mouvements récents (< 24h) peuvent être supprimés
		if ($movement->created_at->diffInHours(now()) > 24) {
			return ApiResponse::error(
				'Les mouvements de plus de 24h ne peuvent pas être supprimés pour préserver l\'intégrité du système FIFO.',
				422,
				'MOVEMENT_TOO_OLD'
			);
		}

		DB::transaction(function () use ($movement) {
			if ($movement->stockLot) {
				// Restaurer la quantité dans le lot
				$lot = $movement->stockLot;
				$lot->lockForUpdate();

				if ($movement->type_mouvement === 'Entrée') {
					// Pour une entrée, on doit vérifier si on peut retirer la quantité
					if ($lot->quantite_restante < $movement->quantite) {
						abort(422, 'Impossible de supprimer ce mouvement : le lot a déjà été partiellement consommé.');
					}
					$lot->quantite_restante -= $movement->quantite;
					$lot->quantite_initiale -= $movement->quantite;
				} else {
					// Pour une sortie, on restaure la quantité
					$lot->quantite_restante += $movement->quantite;
				}
				$lot->save();
			}

			// Mettre à jour le stock principal
			$stock = Stock::where('company_id', $movement->company_id)->lockForUpdate()->findOrFail($movement->stock_id);
			$stock->quantite_actuelle = $stock->quantite_actuelle_calculee;
			$stock->save();

			$movement->delete();
		});

		return ApiResponse::success(null, 'stock.movements.deleted');
	}

	public function restore($id)
	{
		$companyId = request()->user()->company_id;
		$movement = StockMovement::withTrashed()->where('company_id', $companyId)->findOrFail($id);
		$this->authorizeMovement($movement);

		DB::transaction(function () use ($movement) {
			$stock = Stock::where('company_id', $movement->company_id)->lockForUpdate()->findOrFail($movement->stock_id);
			if ($movement->type_mouvement === 'Entrée') {
				$stock->quantite_actuelle += (int) $movement->quantite;
			} else {
				if ($stock->quantite_actuelle < $movement->quantite) {
					abort(422, __('messages.stock.movements.not_enough'));
				}
				$stock->quantite_actuelle -= (int) $movement->quantite;
			}
			$stock->save();
			$movement->restore();
		});

		return ApiResponse::success($movement->fresh()->load(['stock:id,article_id','stock.article:id,nom_article']), 'stock.movements.restored');
	}

	public function show(StockMovement $movement)
	{
		$this->authorizeMovement($movement);
		$movement->load([
			'stock:id,article_id',
			'stock.article:id,nom_article',
			'stockLot:id,code,numero_lot,date_expiration,prix_unitaire_achat'
		]);
		return ApiResponse::success($movement, 'stock.movements.details');
	}

	public function movementsByLot($lotId)
	{
		$companyId = request()->user()->company_id;
		$perPage = (int) (request('per_page') ?? 15);

		$movements = StockMovement::where('company_id', $companyId)
			->where('stock_lot_id', $lotId)
			->with([
				'stock:id,article_id',
				'stock.article:id,nom_article',
				'stockLot:id,code,numero_lot'
			])
			->orderBy('date_mouvement', 'desc')
			->paginate($perPage);

		return ApiResponse::success($movements, 'stock.movements.by_lot');
	}

	public function movementsByArticle($articleId)
	{
		$companyId = request()->user()->company_id;
		$perPage = (int) (request('per_page') ?? 15);

		$movements = StockMovement::where('company_id', $companyId)
			->forArticle($articleId)
			->with([
				'stock:id,article_id',
				'stock.article:id,nom_article',
				'stockLot:id,code,numero_lot'
			])
			->orderBy('date_mouvement', 'desc')
			->paginate($perPage);

		return ApiResponse::success($movements, 'stock.movements.by_article');
	}

	private function authorizeMovement(StockMovement $movement): void
	{
		if ($movement->company_id !== request()->user()->company_id) {
			abort(403);
		}
	}
}


