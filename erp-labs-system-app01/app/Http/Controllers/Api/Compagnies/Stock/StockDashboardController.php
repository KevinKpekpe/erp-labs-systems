<?php

namespace App\Http\Controllers\Api\Compagnies\Stock;

use App\Http\Controllers\Controller;
use App\Models\Article;
use App\Models\Stock;
use App\Models\StockMovement;
use App\Support\ApiResponse;
use Illuminate\Support\Facades\DB;

class StockDashboardController extends Controller
{
    public function metrics()
    {
        $companyId = request()->user()->company_id;

        // Nombre total d'articles distincts en stock pour la compagnie
        $totalArticles = (int) Stock::where('company_id', $companyId)
            ->distinct('article_id')
            ->count('article_id');

        // Articles en rupture (quantité 0)
        $articlesEnRupture = (int) Stock::where('company_id', $companyId)
            ->where('quantite_actuelle', '<=', 0)
            ->count();

        // Articles en situation critique (<= seuil_critique et > 0)
        $articlesCritiques = (int) Stock::where('company_id', $companyId)
            ->whereColumn('quantite_actuelle', '<=', 'seuil_critique')
            ->where('quantite_actuelle', '>', 0)
            ->count();

        // Valeur totale du stock = somme(quantite_actuelle * prix_unitaire de l'article)
        $valeurTotale = (float) Stock::where('stocks.company_id', $companyId)
            ->join('articles', function ($join) {
                $join->on('articles.id', '=', 'stocks.article_id');
            })
            ->sum(DB::raw('COALESCE(stocks.quantite_actuelle,0) * COALESCE(articles.prix_unitaire,0)'));

        // Mouvements aujourd'hui
        $mouvementsAujourdhui = (int) StockMovement::where('company_id', $companyId)
            ->whereDate('date_mouvement', now()->toDateString())
            ->count();

        return ApiResponse::success([
            'totalArticles' => $totalArticles,
            'articlesEnRupture' => $articlesEnRupture,
            'articlesCritiques' => $articlesCritiques,
            'valeurTotale' => $valeurTotale,
            'mouvementsAujourdhui' => $mouvementsAujourdhui,
        ], 'stock.dashboard.metrics');
    }

    public function critical()
    {
        $companyId = request()->user()->company_id;
        $perPage = (int) (request('per_page') ?? 10);

        $criticals = Stock::where('company_id', $companyId)
            ->with(['article:id,nom_article,categorie_id'])
            ->whereColumn('quantite_actuelle', '<=', 'seuil_critique')
            ->orderBy('quantite_actuelle', 'asc')
            ->paginate($perPage);

        return ApiResponse::success($criticals, 'stock.dashboard.critical');
    }

    public function movementsRecent()
    {
        $companyId = request()->user()->company_id;
        $perPage = (int) (request('per_page') ?? 10);

        $movements = StockMovement::where('company_id', $companyId)
            ->with(['stock:id,article_id', 'stock.article:id,nom_article'])
            ->orderBy('date_mouvement', 'desc')
            ->paginate($perPage);

        return ApiResponse::success($movements, 'stock.dashboard.movements_recent');
    }
}


