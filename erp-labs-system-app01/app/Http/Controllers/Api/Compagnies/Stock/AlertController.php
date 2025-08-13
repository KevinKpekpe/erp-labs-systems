<?php

namespace App\Http\Controllers\Api\Compagnies\Stock;

use App\Http\Controllers\Controller;
use App\Models\Stock;
use App\Models\StockAlert;
use App\Support\ApiResponse;

class AlertController extends Controller
{
    public function index()
    {
        $companyId = request()->user()->company_id;
        $q = request('q') ?? request('search');
        $perPage = (int) (request('per_page') ?? 15);
        $compute = (bool) request('compute', false);

        $alerts = StockAlert::where('company_id', $companyId)
            ->with(['stock:id,article_id','stock.article:id,nom_article'])
            ->search($q)
            ->orderByDesc('date_alerte')
            ->paginate($perPage);

        if ($compute || $alerts->total() === 0) {
            $stocks = Stock::with(['article:id,nom_article'])
                ->where('company_id', $companyId)
                ->whereColumn('quantite_actuelle', '<=', 'seuil_critique')
                ->orderBy('quantite_actuelle', 'asc')
                ->limit($perPage)
                ->get()
                ->map(function ($s) {
                    return [
                        'id' => $s->id,
                        'stock' => ['id' => $s->id, 'article' => ['id' => $s->article_id, 'nom_article' => $s->article->nom_article ?? '']],
                        'quantite_actuelle' => (int) $s->quantite_actuelle,
                        'seuil_critique' => (int) $s->seuil_critique,
                        'date_alerte' => now()->toDateTimeString(),
                        'message_alerte' => null,
                    ];
                });
            return ApiResponse::success($stocks, 'stock.alerts.computed');
        }

        return ApiResponse::success($alerts, 'stock.alerts.list');
    }
}


