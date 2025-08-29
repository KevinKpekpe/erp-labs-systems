<?php

namespace App\Services;

use App\Models\Stock;
use App\Models\StockLot;
use App\Models\Company;
use Illuminate\Support\Collection;
use Carbon\Carbon;

class StockAlertService
{
    /**
     * Obtient toutes les alertes de stock pour une entreprise
     */
    public function getStockAlerts(Company $company): array
    {
        return [
            'critical_stock' => $this->getCriticalStockAlerts($company),
            'expiring_soon' => $this->getExpiringSoonAlerts($company),
            'expired_items' => $this->getExpiredItemsAlerts($company),
            'low_stock_trends' => $this->getLowStockTrends($company),
            'overstock_items' => $this->getOverstockAlerts($company),
        ];
    }

    /**
     * Articles en stock critique (quantité ≤ seuil critique)
     */
    public function getCriticalStockAlerts(Company $company): Collection
    {
        return Stock::where('company_id', $company->id)
            ->whereRaw('quantite_actuelle <= seuil_critique')
            ->where('quantite_actuelle', '>', 0)
            ->with(['article:id,nom_article,unite_mesure', 'article.categorie:id,nom_categorie'])
            ->get()
            ->map(function ($stock) {
                $stock->urgence = $stock->quantite_actuelle == 0 ? 'CRITIQUE' : 'ÉLEVÉE';
                $stock->jours_restants = $this->calculateDaysUntilStockout($stock);
                return $stock;
            });
    }

    /**
     * Articles proches de l'expiration (30 jours)
     */
    public function getExpiringSoonAlerts(Company $company): Collection
    {
        $dateLimite = Carbon::now()->addDays(30);

        return StockLot::where('stock_lots.company_id', $company->id)
            ->where('stock_lots.quantite_restante', '>', 0)
            ->whereNotNull('stock_lots.date_expiration')
            ->where('stock_lots.date_expiration', '<=', $dateLimite)
            ->where('stock_lots.date_expiration', '>', Carbon::now())
            ->join('articles', 'stock_lots.article_id', '=', 'articles.id')
            ->select([
                'stock_lots.*',
                'articles.nom_article',
                'articles.unite_mesure'
            ])
            ->orderBy('stock_lots.date_expiration')
            ->get()
            ->map(function ($lot) {
                $lot->jours_avant_expiration = Carbon::now()->diffInDays($lot->date_expiration, false);
                $lot->urgence = $lot->jours_avant_expiration <= 7 ? 'CRITIQUE' :
                               ($lot->jours_avant_expiration <= 15 ? 'ÉLEVÉE' : 'MODÉRÉE');
                return $lot;
            });
    }

    /**
     * Articles expirés
     */
    public function getExpiredItemsAlerts(Company $company): Collection
    {
        return StockLot::where('stock_lots.company_id', $company->id)
            ->where('stock_lots.quantite_restante', '>', 0)
            ->whereNotNull('stock_lots.date_expiration')
            ->where('stock_lots.date_expiration', '<', Carbon::now())
            ->join('articles', 'stock_lots.article_id', '=', 'articles.id')
            ->select([
                'stock_lots.*',
                'articles.nom_article',
                'articles.unite_mesure'
            ])
            ->orderBy('stock_lots.date_expiration')
            ->get()
            ->map(function ($lot) {
                $lot->jours_expires = Carbon::now()->diffInDays($lot->date_expiration);
                $lot->valeur_perdue = $lot->quantite_restante * ($lot->prix_unitaire_achat ?? 0);
                return $lot;
            });
    }

    /**
     * Tendances de stock bas (consommation rapide)
     */
    public function getLowStockTrends(Company $company): Collection
    {
        // Articles dont la consommation est rapide (seuil critique atteint dans les 7 jours)
        return Stock::where('stocks.company_id', $company->id)
            ->whereRaw('stocks.quantite_actuelle <= (stocks.seuil_critique * 1.5)')
            ->where('stocks.quantite_actuelle', '>', 0)
            ->with(['article:id,nom_article,unite_mesure'])
            ->get()
            ->map(function ($stock) {
                $stock->tendance = $this->analyzeStockTrend($stock);
                return $stock;
            });
    }

    /**
     * Articles en surstock
     */
    public function getOverstockAlerts(Company $company): Collection
    {
        return Stock::where('company_id', $company->id)
            ->whereRaw('quantite_actuelle > (seuil_critique * 3)')
            ->with(['article:id,nom_article,unite_mesure'])
            ->get()
            ->map(function ($stock) {
                $stock->surstock_ratio = round(($stock->quantite_actuelle / $stock->seuil_critique), 2);
                $stock->valeur_surstock = $stock->quantite_actuelle * ($stock->article->prix_unitaire ?? 0);
                return $stock;
            });
    }

    /**
     * Calcule les jours avant rupture de stock
     */
    private function calculateDaysUntilStockout(Stock $stock): int
    {
        // Logique simplifiée : estimation basée sur la consommation moyenne
        $consommationMoyenne = $this->getAverageConsumption($stock);

        if ($consommationMoyenne <= 0) return 999; // Pas de consommation

        return (int) ($stock->quantite_actuelle / $consommationMoyenne);
    }

    /**
     * Analyse la tendance de consommation
     */
    private function analyzeStockTrend(Stock $stock): string
    {
        $consommationMoyenne = $this->getAverageConsumption($stock);

        if ($consommationMoyenne <= 0) return 'STABLE';
        if ($consommationMoyenne > 10) return 'ÉLEVÉE';
        if ($consommationMoyenne > 5) return 'MODÉRÉE';

        return 'FAIBLE';
    }

    /**
     * Calcule la consommation moyenne quotidienne
     */
    private function getAverageConsumption(Stock $stock): float
    {
        // Consommation des 30 derniers jours
        $debut = Carbon::now()->subDays(30);

        $consommation = \App\Models\StockMovement::where('stock_id', $stock->id)
            ->where('type_mouvement', 'Sortie')
            ->where('date_mouvement', '>=', $debut)
            ->sum('quantite');

        return $consommation / 30;
    }

    /**
     * Génère un rapport d'alertes pour le laboratoire
     */
    public function generateLaboratoryReport(Company $company): array
    {
        $alertes = $this->getStockAlerts($company);

        return [
            'resume' => [
                'total_alertes' => $alertes['critical_stock']->count() +
                                  $alertes['expiring_soon']->count() +
                                  $alertes['expired_items']->count(),
                'stock_critique' => $alertes['critical_stock']->count(),
                'expiration_proche' => $alertes['expiring_soon']->count(),
                'articles_expires' => $alertes['expired_items']->count(),
                'surstock' => $alertes['overstock_items']->count(),
            ],
            'alertes' => $alertes,
            'recommandations' => $this->generateRecommendations($alertes),
        ];
    }

    /**
     * Génère des recommandations basées sur les alertes
     */
    private function generateRecommendations(array $alertes): array
    {
        $recommandations = [];

        if ($alertes['critical_stock']->count() > 0) {
            $recommandations[] = [
                'type' => 'URGENT',
                'message' => 'Commander immédiatement les articles en stock critique',
                'articles' => $alertes['critical_stock']->pluck('article.nom_article')->toArray()
            ];
        }

        if ($alertes['expired_items']->count() > 0) {
            $recommandations[] = [
                'type' => 'CRITIQUE',
                'message' => 'Retirer et éliminer les articles expirés',
                'valeur_perdue' => $alertes['expired_items']->sum('valeur_perdue')
            ];
        }

        if ($alertes['expiring_soon']->count() > 0) {
            $recommandations[] = [
                'type' => 'ATTENTION',
                'message' => 'Utiliser en priorité les articles proches de l\'expiration',
                'articles' => $alertes['expiring_soon']->pluck('nom_article')->toArray()
            ];
        }

        return $recommandations;
    }
}
