<?php

namespace App\Services\Reports;

use App\Models\Stock;
use App\Models\StockMovement;
use App\Models\CategoryArticle;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class InventoryReportService extends BaseReportService
{
    /**
     * Génère les données du rapport d'inventaire
     */
    public function generate(): array
    {
        $data = [
            'summary' => $this->generateSummary(),
            'articles' => $this->getArticles(),
            'critical_articles' => $this->getCriticalArticles(),
            'recent_movements' => $this->getRecentMovements(),
            'category_distribution' => $this->getCategoryDistribution(),
            'report_info' => [
                'title' => 'Rapport d\'Inventaire',
                'period_description' => $this->getPeriodDescription(),
                'start_date' => $this->startDate->format('d/m/Y'),
                'end_date' => $this->endDate->format('d/m/Y'),
                'generated_at' => Carbon::now()->format('d/m/Y H:i:s'),
            ],
            'company' => $this->getCompanyInfo(),
            'user' => $this->getUserInfo(),
        ];

        return $data;
    }

    /**
     * Génère le résumé de l'inventaire
     */
    private function generateSummary(): array
    {
        $totalArticles = DB::table('stocks')
            ->where('stocks.company_id', $this->companyId)
            ->where('stocks.quantite_actuelle', '>', 0)
            ->count();

        // Debug: Vérifions les données brutes
        $debugStocks = DB::table('stocks')
            ->where('stocks.company_id', $this->companyId)
            ->join('articles', 'stocks.article_id', '=', 'articles.id')
            ->select([
                'stocks.id',
                'stocks.quantite_actuelle',
                'articles.prix_unitaire',
                'articles.nom_article'
            ])
            ->get();

        Log::info('Debug stocks data:', [
            'company_id' => $this->companyId,
            'stocks_count' => $debugStocks->count(),
            'stocks_data' => $debugStocks->toArray()
        ]);

        $totalValue = DB::table('stocks')
            ->where('stocks.company_id', $this->companyId)
            ->join('articles', 'stocks.article_id', '=', 'articles.id')
            ->sum(DB::raw('COALESCE(stocks.quantite_actuelle,0) * COALESCE(articles.prix_unitaire,0)'));

        Log::info('Debug total value calculation:', [
            'total_value' => $totalValue,
            'calculation' => 'SUM(quantite_actuelle * prix_unitaire)'
        ]);

        $criticalItems = DB::table('stocks')
            ->where('stocks.company_id', $this->companyId)
            ->whereRaw('stocks.quantite_actuelle <= stocks.seuil_critique')
            ->count();

        // Correction : utiliser la relation via articles
        $expiredItems = DB::table('stocks')
            ->where('stocks.company_id', $this->companyId)
            ->join('articles', 'stocks.article_id', '=', 'articles.id')
            ->join('stock_lots', 'articles.id', '=', 'stock_lots.article_id')
            ->where('stock_lots.date_expiration', '<', now())
            ->where('stock_lots.quantite_restante', '>', 0)
            ->distinct('stocks.id')
            ->count('stocks.id');

        return [
            'total_articles' => $totalArticles,
            'total_value' => $totalValue,
            'critical_items' => $criticalItems,
            'expired_items' => $expiredItems,
        ];
    }

    /**
     * Obtient la liste des articles en stock
     */
    private function getArticles()
    {
        return DB::table('stocks')
            ->where('stocks.company_id', $this->companyId)
            ->join('articles', 'stocks.article_id', '=', 'articles.id')
            ->leftJoin('categorie_articles', 'articles.categorie_id', '=', 'categorie_articles.id')
            ->select([
                'stocks.*',
                'articles.nom_article',
                'articles.prix_unitaire',
                'articles.unite_mesure',
                'categorie_articles.nom_categorie'
            ])
            ->orderBy('stocks.quantite_actuelle', 'asc')
            ->get();
    }

    /**
     * Obtient les articles en situation critique
     */
    private function getCriticalArticles()
    {
        return DB::table('stocks')
            ->where('stocks.company_id', $this->companyId)
            ->whereRaw('stocks.quantite_actuelle <= stocks.seuil_critique')
            ->join('articles', 'stocks.article_id', '=', 'articles.id')
            ->leftJoin('categorie_articles', 'articles.categorie_id', '=', 'categorie_articles.id')
            ->select([
                'stocks.*',
                'articles.nom_article',
                'articles.prix_unitaire',
                'articles.unite_mesure',
                'categorie_articles.nom_categorie'
            ])
            ->orderBy('stocks.quantite_actuelle', 'asc')
            ->get()
            ->map(function ($stock) {
                $stock->last_movement_date = $this->getLastMovementDate($stock->id);
                return $stock;
            });
    }

    /**
     * Obtient les mouvements récents
     */
    private function getRecentMovements()
    {
        return DB::table('mouvement_stocks')
            ->where('mouvement_stocks.company_id', $this->companyId)
            ->whereBetween('mouvement_stocks.date_mouvement', [$this->startDate, $this->endDate])
            ->join('stocks', 'mouvement_stocks.stock_id', '=', 'stocks.id')
            ->join('articles', 'stocks.article_id', '=', 'articles.id')
            ->select([
                'mouvement_stocks.*',
                'stocks.code as stock_code',
                'articles.nom_article',
                'articles.code as article_code'
            ])
            ->orderByDesc('mouvement_stocks.date_mouvement')
            ->limit(50)
            ->get();
    }

    /**
     * Obtient la répartition par catégorie
     */
    private function getCategoryDistribution()
    {
        $totalValue = Stock::where('stocks.company_id', $this->companyId)
            ->join('articles', 'stocks.article_id', '=', 'articles.id')
            ->selectRaw('SUM(stocks.quantite_actuelle * articles.prix_unitaire) as total')
            ->value('total') ?? 1;

        return DB::table('categorie_articles')
            ->where('categorie_articles.company_id', $this->companyId)
            ->leftJoin('articles', 'categorie_articles.id', '=', 'articles.categorie_id')
            ->leftJoin('stocks', 'articles.id', '=', 'stocks.article_id')
            ->select([
                'categorie_articles.*',
                DB::raw('COUNT(DISTINCT articles.id) as article_count'),
                DB::raw('COALESCE(SUM(stocks.quantite_actuelle * articles.prix_unitaire), 0) as total_value')
            ])
            ->groupBy('categorie_articles.id', 'categorie_articles.company_id', 'categorie_articles.code', 'categorie_articles.nom_categorie', 'categorie_articles.created_at', 'categorie_articles.updated_at', 'categorie_articles.deleted_at')
            ->get()
            ->map(function ($category) use ($totalValue) {
                $category->percentage = $totalValue > 0 ? ($category->total_value / $totalValue) * 100 : 0;
                return $category;
            })
            ->sortByDesc('total_value');
    }

    /**
     * Obtient la date du dernier mouvement pour un stock
     */
    private function getLastMovementDate(int $stockId): ?string
    {
        $movement = StockMovement::where('stock_id', $stockId)
            ->orderByDesc('date_mouvement')
            ->first();

        return $movement ? $this->formatDate($movement->date_mouvement) : null;
    }

    /**
     * Obtient la description de la période
     */
    private function getPeriodDescription(): string
    {
        if ($this->filters['period'] === 'custom') {
            return "Du {$this->startDate->format('d/m/Y')} au {$this->endDate->format('d/m/Y')}";
        }

        $periods = [
            'today' => 'Aujourd\'hui',
            'week' => 'Cette semaine',
            'month' => 'Ce mois',
            'quarter' => 'Ce trimestre',
            'year' => 'Cette année',
            'last_7_days' => '7 derniers jours',
            'last_30_days' => '30 derniers jours',
            'last_90_days' => '90 derniers jours',
            'last_year' => 'Année précédente',
        ];

        return $periods[$this->filters['period']] ?? 'Période inconnue';
    }

    /**
     * Obtient les informations de la compagnie
     */
    private function getCompanyInfo()
    {
        return DB::table('companies')
            ->where('id', $this->companyId)
            ->first();
    }

    /**
     * Obtient les informations de l'utilisateur
     */
    private function getUserInfo()
    {
        $user = request()->user();
        return [
            'username' => $user->username ?? 'Système',
            'email' => $user->email ?? 'N/A',
        ];
    }
}
