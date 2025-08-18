<?php

namespace App\Http\Controllers\Api\Compagnies\Stock;

use App\Http\Controllers\Controller;
use App\Http\Requests\Compagnies\Stock\StockLotStoreRequest;
use App\Http\Requests\Compagnies\Stock\StockLotUpdateRequest;
use App\Models\StockLot;
use App\Support\ApiResponse;

class StockLotController extends Controller
{
    public function index()
    {
        $companyId = request()->user()->company_id;
        $q = request('q') ?? request('search');
        $perPage = (int) (request('per_page') ?? 15);
        $sort = request('sort', 'date_entree');
        $dir = request('dir', 'desc') === 'asc' ? 'asc' : 'desc';

        // Filtres optionnels
        $articleId = request('article_id');
        $availableOnly = request('available_only') === 'true';
        $expiredOnly = request('expired_only') === 'true';
        $nearExpirationOnly = request('near_expiration_only') === 'true';

        $query = StockLot::forCompany($companyId)
            ->with(['article:id,nom_article'])
            ->search($q);

        if ($articleId) {
            $query->forArticle($articleId);
        }

        if ($availableOnly) {
            $query->available();
        }

        if ($expiredOnly) {
            $query->where('date_expiration', '<', now())
                  ->where('quantite_restante', '>', 0);
        }

        if ($nearExpirationOnly) {
            $days = request('days', 30);
            $query->whereBetween('date_expiration', [now(), now()->addDays($days)])
                  ->where('quantite_restante', '>', 0);
        }

        $lots = $query->orderBy($sort, $dir)->paginate($perPage);

        // Ajouter des informations calculées
        $lots->getCollection()->transform(function ($lot) {
            $lot->is_expired = $lot->isExpired();
            $lot->is_near_expiration = $lot->isNearExpiration();
            $lot->pourcentage_consommation = $lot->pourcentage_consommation;
            return $lot;
        });

        return ApiResponse::success($lots, 'stock.lots.list');
    }

    public function show(StockLot $stockLot)
    {
        $this->authorizeLot($stockLot);

        $stockLot->load([
            'article:id,nom_article',
            'movements' => function($query) {
                $query->orderBy('date_mouvement', 'desc')->limit(10);
            }
        ]);

        $stockLot->is_expired = $stockLot->isExpired();
        $stockLot->is_near_expiration = $stockLot->isNearExpiration();
        $stockLot->pourcentage_consommation = $stockLot->pourcentage_consommation;
        $stockLot->valeur_restante = $stockLot->quantite_restante * ($stockLot->prix_unitaire_achat ?? 0);

        return ApiResponse::success($stockLot, 'stock.lots.details');
    }

    public function update(StockLotUpdateRequest $request, StockLot $stockLot)
    {
        $this->authorizeLot($stockLot);
        $data = $request->validated();

        // Seuls certains champs peuvent être modifiés
        $allowedFields = [
            'date_expiration',
            'prix_unitaire_achat',
            'numero_lot',
            'fournisseur_lot',
            'commentaire'
        ];

        $payload = [];
        foreach ($allowedFields as $field) {
            if (array_key_exists($field, $data)) {
                $payload[$field] = $data[$field];
            }
        }

        if ($payload) {
            $stockLot->update($payload);
        }

        return ApiResponse::success($stockLot->fresh(), 'stock.lots.updated');
    }

    public function destroy(StockLot $stockLot)
    {
        $this->authorizeLot($stockLot);

        // Vérifier que le lot est entièrement consommé ou peut être supprimé en sécurité
        if ($stockLot->quantite_restante > 0) {
            return ApiResponse::error(
                'Impossible de supprimer un lot qui contient encore du stock. Quantité restante: ' . $stockLot->quantite_restante,
                422,
                'LOT_NOT_EMPTY'
            );
        }

        // Vérifier qu'il n'y a pas de mouvements récents (< 24h)
        $recentMovements = $stockLot->movements()
            ->where('created_at', '>', now()->subDay())
            ->exists();

        if ($recentMovements) {
            return ApiResponse::error(
                'Impossible de supprimer un lot avec des mouvements récents (< 24h).',
                422,
                'LOT_HAS_RECENT_MOVEMENTS'
            );
        }

        $stockLot->delete(); // SoftDelete
        return ApiResponse::success(null, 'stock.lots.deleted');
    }

    public function trashed()
    {
        $companyId = request()->user()->company_id;
        $q = request('q') ?? request('search');
        $perPage = (int) (request('per_page') ?? 15);

        $lots = StockLot::onlyTrashed()
            ->forCompany($companyId)
            ->with(['article:id,nom_article'])
            ->search($q)
            ->orderBy('deleted_at', 'desc')
            ->paginate($perPage);

        return ApiResponse::success($lots, 'stock.lots.trashed');
    }

    public function restore($id)
    {
        $companyId = request()->user()->company_id;
        $stockLot = StockLot::withTrashed()
            ->forCompany($companyId)
            ->findOrFail($id);

        $this->authorizeLot($stockLot);
        $stockLot->restore();

        return ApiResponse::success($stockLot->fresh(), 'stock.lots.restored');
    }

    public function forceDelete($id)
    {
        $companyId = request()->user()->company_id;
        $stockLot = StockLot::withTrashed()
            ->forCompany($companyId)
            ->findOrFail($id);

        $this->authorizeLot($stockLot);

        // Vérifier qu'il n'y a pas de mouvements liés
        if ($stockLot->movements()->exists()) {
            return ApiResponse::error(
                'Impossible de supprimer définitivement un lot avec des mouvements associés.',
                422,
                'LOT_HAS_MOVEMENTS'
            );
        }

        $stockLot->forceDelete();
        return ApiResponse::success(null, 'stock.lots.force_deleted');
    }

    public function expiredLots()
    {
        $companyId = request()->user()->company_id;
        $perPage = (int) (request('per_page') ?? 15);

        $lots = StockLot::forCompany($companyId)
            ->with(['article:id,nom_article'])
            ->where('date_expiration', '<', now())
            ->where('quantite_restante', '>', 0)
            ->orderBy('date_expiration', 'asc')
            ->paginate($perPage);

        return ApiResponse::success($lots, 'stock.lots.expired');
    }

    public function nearExpirationLots()
    {
        $companyId = request()->user()->company_id;
        $days = (int) (request('days', 30));
        $perPage = (int) (request('per_page') ?? 15);

        $lots = StockLot::forCompany($companyId)
            ->with(['article:id,nom_article'])
            ->whereBetween('date_expiration', [now(), now()->addDays($days)])
            ->where('quantite_restante', '>', 0)
            ->orderBy('date_expiration', 'asc')
            ->paginate($perPage);

        return ApiResponse::success($lots, 'stock.lots.near_expiration');
    }

    public function stockValue()
    {
        $companyId = request()->user()->company_id;
        $articleId = request('article_id');

        $query = StockLot::forCompany($companyId)->available();

        if ($articleId) {
            $query->forArticle($articleId);
        }

        $lots = $query->get();

        $stats = [
            'total_lots' => $lots->count(),
            'total_quantity' => $lots->sum('quantite_restante'),
            'total_value' => $lots->sum(function($lot) {
                return $lot->quantite_restante * ($lot->prix_unitaire_achat ?? 0);
            }),
            'average_unit_price' => $lots->where('prix_unitaire_achat', '>', 0)->avg('prix_unitaire_achat'),
            'lots_with_expiration' => $lots->whereNotNull('date_expiration')->count(),
            'expired_lots' => $lots->filter->isExpired()->count(),
            'near_expiration_lots' => $lots->filter->isNearExpiration()->count(),
        ];

        return ApiResponse::success($stats, 'stock.lots.value_stats');
    }

    private function authorizeLot(StockLot $stockLot): void
    {
        if ($stockLot->company_id !== request()->user()->company_id) {
            abort(403);
        }
    }
}
