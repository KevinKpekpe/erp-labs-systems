<?php

namespace App\Http\Controllers\Api\Compagnies\Stock;

use App\Http\Controllers\Controller;
use App\Models\Stock;
use App\Models\StockAlert;
use App\Models\StockLot;
use App\Support\ApiResponse;
use Illuminate\Http\Request;

class AlertController extends Controller
{
    public function index(Request $request)
    {
        $companyId = $request->user()->company_id;

        // Paramètres de base
        $q = $request->get('q') ?? $request->get('search');
        $perPage = (int) ($request->get('per_page') ?? 15);
        $sort = $request->get('sort', 'date_alerte');
        $dir = $request->get('dir', 'desc') === 'asc' ? 'asc' : 'desc';

        // Filtres avancés
        $type = $request->get('type');
        $priorite = $request->get('priorite');
        $statut = $request->get('statut');
        $dateDebut = $request->get('date_debut');
        $dateFin = $request->get('date_fin');
        $stockId = $request->get('stock_id');
        $lotId = $request->get('lot_id');
        $trashed = $request->get('trashed', false);

        // Construction de la requête
        $query = StockAlert::where('company_id', $companyId);

        // Recherche textuelle
        if ($q) {
            $query->search($q);
        }

        // Application des filtres
        $query->byType($type)
              ->byPriorite($priorite)
              ->byStatut($statut)
              ->byDateRange($dateDebut, $dateFin)
              ->byStock($stockId)
              ->byLot($lotId);

        // Gestion de la corbeille
        if ($trashed) {
            $query->onlyTrashed();
        }

        // Tri et pagination
        $alerts = $query->with([
                'stock:id,article_id',
                'stock.article:id,nom_article,nom_categorie',
                'lot:id,code,numero_lot,date_expiration'
            ])
            ->orderBy($sort, $dir)
            ->paginate($perPage);

        // Si aucune alerte trouvée et que c'est demandé, calculer les alertes automatiquement
        if ($request->get('compute', false) || ($alerts->total() === 0 && !$trashed)) {
            $computedAlerts = $this->computeAlerts($companyId);
            return ApiResponse::success($computedAlerts, 'stock.alerts.computed');
        }

        return ApiResponse::success($alerts, 'stock.alerts.list');
    }

    public function show(StockAlert $alert)
    {
        $this->authorizeAlert($alert);

        $alert->load([
            'stock:id,article_id',
            'stock.article:id,nom_article,nom_categorie',
            'lot:id,code,numero_lot,date_expiration'
        ]);

        return ApiResponse::success($alert, 'stock.alerts.details');
    }

    public function update(Request $request, StockAlert $alert)
    {
        $this->authorizeAlert($alert);

        $data = $request->validate([
            'statut' => 'sometimes|in:nouveau,en_cours,traite,ignore',
            'priorite' => 'sometimes|in:haute,moyenne,faible',
            'message' => 'sometimes|string|max:1000',
        ]);

        if (isset($data['statut']) && $data['statut'] === 'traite') {
            $data['date_traitement'] = now();
        }

        $alert->update($data);

        return ApiResponse::success($alert->fresh(), 'stock.alerts.updated');
    }

    public function destroy(StockAlert $alert)
    {
        $this->authorizeAlert($alert);
        $alert->delete();

        return ApiResponse::success(null, 'stock.alerts.deleted');
    }

    public function restore($id)
    {
        $companyId = request()->user()->company_id;
        $alert = StockAlert::onlyTrashed()
            ->where('company_id', $companyId)
            ->findOrFail($id);

        $alert->restore();

        return ApiResponse::success($alert, 'stock.alerts.restored');
    }

    public function forceDelete($id)
    {
        $companyId = request()->user()->company_id;
        $alert = StockAlert::onlyTrashed()
            ->where('company_id', $companyId)
            ->findOrFail($id);

        $alert->forceDelete();

        return ApiResponse::success(null, 'stock.alerts.force_deleted');
    }

    public function trashed()
    {
        $companyId = request()->user()->company_id;
        $q = request('q') ?? request('search');
        $perPage = (int) (request('per_page') ?? 15);

        $alerts = StockAlert::onlyTrashed()
            ->where('company_id', $companyId)
            ->with([
                'stock:id,article_id',
                'stock.article:id,nom_article,nom_categorie',
                'lot:id,code,numero_lot,date_expiration'
            ])
            ->search($q)
            ->orderByDesc('deleted_at')
            ->paginate($perPage);

        return ApiResponse::success($alerts, 'stock.alerts.trashed');
    }

    /**
     * Calculer automatiquement les alertes basées sur l'état actuel du stock
     */
    private function computeAlerts($companyId)
    {
        $alerts = collect();

        // 1. Alertes de stock critique
        $stocksCritiques = Stock::where('company_id', $companyId)
            ->with(['article:id,nom_article,nom_categorie'])
            ->whereColumn('quantite_actuelle', '<=', 'seuil_critique')
            ->get();

        foreach ($stocksCritiques as $stock) {
            $alerts->push([
                'id' => 'auto_' . $stock->id,
                'type' => StockAlert::TYPE_STOCK_CRITIQUE,
                'priorite' => StockAlert::PRIORITE_HAUTE,
                'titre' => 'Stock critique détecté',
                'message' => "Le stock de {$stock->article->nom_article} est sous le seuil critique ({$stock->quantite_actuelle} unités restantes)",
                'stock_id' => $stock->id,
                'date_alerte' => now()->toDateTimeString(),
                'statut' => StockAlert::STATUT_NOUVEAU,
                'stock' => [
                    'id' => $stock->id,
                    'article' => [
                        'id' => $stock->article_id,
                        'nom_article' => $stock->article->nom_article ?? 'Article inconnu',
                        'nom_categorie' => $stock->article->nom_categorie ?? 'Catégorie inconnue'
                    ]
                ],
                'created_at' => now()->toDateTimeString(),
            ]);
        }

        // 2. Alertes d'expiration proche
        $lotsExpirationProche = StockLot::where('company_id', $companyId)
            ->where('quantite_restante', '>', 0)
            ->where('date_expiration', '<=', now()->addDays(30))
            ->where('date_expiration', '>', now())
            ->with(['article:id,nom_article,nom_categorie'])
            ->get();

        foreach ($lotsExpirationProche as $lot) {
            $joursRestants = now()->diffInDays($lot->date_expiration, false);
            $priorite = $joursRestants <= 7 ? StockAlert::PRIORITE_HAUTE :
                       ($joursRestants <= 15 ? StockAlert::PRIORITE_MOYENNE : StockAlert::PRIORITE_FAIBLE);

            $alerts->push([
                'id' => 'auto_lot_' . $lot->id,
                'type' => StockAlert::TYPE_EXPIRATION_PROCHE,
                'priorite' => $priorite,
                'titre' => 'Expiration proche',
                'message' => "Le lot {$lot->code} expire dans {$joursRestants} jours",
                'lot_id' => $lot->id,
                'date_alerte' => now()->toDateTimeString(),
                'statut' => StockAlert::STATUT_NOUVEAU,
                'lot' => [
                    'id' => $lot->id,
                    'code' => $lot->code,
                    'numero_lot' => $lot->numero_lot,
                    'date_expiration' => $lot->date_expiration
                ],
                'created_at' => now()->toDateTimeString(),
            ]);
        }

        // 3. Alertes de lots expirés
        $lotsExpires = StockLot::where('company_id', $companyId)
            ->where('quantite_restante', '>', 0)
            ->where('date_expiration', '<', now())
            ->with(['article:id,nom_article,nom_categorie'])
            ->get();

        foreach ($lotsExpires as $lot) {
            $alerts->push([
                'id' => 'auto_expired_' . $lot->id,
                'type' => StockAlert::TYPE_LOT_EXPIRE,
                'priorite' => StockAlert::PRIORITE_HAUTE,
                'titre' => 'Lot expiré',
                'message' => "Le lot {$lot->code} a expiré le " . $lot->date_expiration->format('d/m/Y'),
                'lot_id' => $lot->id,
                'date_alerte' => now()->toDateTimeString(),
                'statut' => StockAlert::STATUT_NOUVEAU,
                'lot' => [
                    'id' => $lot->id,
                    'code' => $lot->code,
                    'numero_lot' => $lot->numero_lot,
                    'date_expiration' => $lot->date_expiration
                ],
                'created_at' => now()->toDateTimeString(),
            ]);
        }

        return $alerts->values();
    }

    /**
     * Vérifier l'autorisation sur l'alerte
     */
    private function authorizeAlert(StockAlert $alert)
    {
        if ($alert->company_id !== request()->user()->company_id) {
            abort(403, 'Accès non autorisé à cette alerte');
        }
    }
}


