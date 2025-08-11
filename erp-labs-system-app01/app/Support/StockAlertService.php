<?php

namespace App\Support;

use App\Models\Stock;
use App\Models\StockAlert;

class StockAlertService
{
    public static function evaluateAndCreate(Stock $stock): void
    {
        if ($stock->quantite_actuelle <= $stock->seuil_critique) {
            StockAlert::create([
                'company_id' => $stock->company_id,
                'code' => CodeGenerator::generate('alerte_stocks', $stock->company_id, 'ALR'),
                'stock_id' => $stock->id,
                'date_alerte' => now(),
                'quantite_actuelle' => $stock->quantite_actuelle,
                'seuil_critique' => $stock->seuil_critique,
                'message_alerte' => 'Stock critique: '.$stock->quantite_actuelle.' <= '.$stock->seuil_critique,
            ]);
        }
    }
}


