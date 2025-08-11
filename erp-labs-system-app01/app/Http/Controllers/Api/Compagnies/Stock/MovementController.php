<?php

namespace App\Http\Controllers\Api\Compagnies\Stock;

use App\Http\Controllers\Controller;
use App\Http\Requests\Compagnies\Stock\MovementStoreRequest;
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
            ->with(['stock:id,article_id', 'stock.article:id,nom_article'])
            ->search($q)
            ->orderBy($sort, $dir)
            ->paginate($perPage);
        return ApiResponse::success($movements, 'stock.movements.list');
    }

    public function store(MovementStoreRequest $request)
    {
        $companyId = $request->user()->company_id;
        $data = $request->validated();

        $movement = DB::transaction(function () use ($companyId, $data) {
            // Verrou stock pour éviter les races
            $stock = Stock::where('company_id', $companyId)->lockForUpdate()->findOrFail($data['stock_id']);

            $quantity = (int) $data['quantite'];
            if ($quantity <= 0) {
                return ApiResponse::error('validation.invalid_quantity', 422, 'INVALID_QUANTITY');
            }

            if ($data['type_mouvement'] === 'Sortie') {
                if ($stock->quantite_actuelle < $quantity) {
                    return ApiResponse::error('stock.movements.not_enough', 422, 'NOT_ENOUGH_STOCK');
                }
                $stock->quantite_actuelle -= $quantity;
            } else {
                $stock->quantite_actuelle += $quantity;
            }
            $stock->save();

            $movement = StockMovement::create([
                'company_id' => $companyId,
                'code' => CodeGenerator::generate('mouvement_stocks', $companyId, 'MOV'),
                'stock_id' => $stock->id,
                'date_mouvement' => $data['date_mouvement'] ?? now(),
                'quantite' => $quantity,
                'type_mouvement' => $data['type_mouvement'],
                'demande_id' => $data['demande_id'] ?? null,
                'motif' => $data['motif'] ?? null,
            ]);

            return $movement;
        });

        // Note: la génération d'alerte sera faite dans le module Alerte

        return ApiResponse::success($movement->load(['stock:id,article_id', 'stock.article:id,nom_article']), 'stock.movements.created', [], 201);
    }
}


