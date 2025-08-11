<?php

namespace App\Http\Controllers\Api\Compagnies\Stock;

use App\Http\Controllers\Controller;
use App\Models\StockAlert;
use App\Support\ApiResponse;

class AlertController extends Controller
{
    public function index()
    {
        $companyId = request()->user()->company_id;
        $q = request('q') ?? request('search');
        $perPage = (int) (request('per_page') ?? 15);
        $alerts = StockAlert::where('company_id', $companyId)
            ->with(['stock:id,article_id','stock.article:id,nom_article'])
            ->search($q)
            ->orderByDesc('date_alerte')
            ->paginate($perPage);
        return ApiResponse::success($alerts, 'stock.alerts.list');
    }
}


