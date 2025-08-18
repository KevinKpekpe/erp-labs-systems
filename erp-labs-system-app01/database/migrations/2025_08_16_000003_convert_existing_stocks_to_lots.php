<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use App\Models\Stock;
use App\Models\StockLot;
use App\Models\StockMovement;
use App\Support\CodeGenerator;

return new class extends Migration
{
    public function up(): void
    {
        // Cette migration convertit les stocks existants en lots FIFO
        DB::transaction(function () {
            // 1. Récupérer tous les stocks existants avec quantité > 0
            $stocks = Stock::where('quantite_actuelle', '>', 0)->get();

            foreach ($stocks as $stock) {
                // 2. Créer un lot initial pour chaque stock existant
                $lot = StockLot::create([
                    'company_id' => $stock->company_id,
                    'code' => CodeGenerator::generate('stock_lots', $stock->company_id, 'LOT'),
                    'article_id' => $stock->article_id,
                    'quantite_initiale' => $stock->quantite_actuelle,
                    'quantite_restante' => $stock->quantite_actuelle,
                    'date_entree' => $stock->created_at ?? now(),
                    'date_expiration' => $stock->date_expiration,
                    'prix_unitaire_achat' => null, // Sera défini lors des prochaines entrées
                    'numero_lot' => 'MIGRATION-' . $stock->id,
                    'fournisseur_lot' => 'Données existantes',
                    'commentaire' => 'Lot créé lors de la migration FIFO depuis stock existant',
                ]);

                // 3. Créer un mouvement d'entrée pour ce lot
                StockMovement::create([
                    'company_id' => $stock->company_id,
                    'code' => CodeGenerator::generate('mouvement_stocks', $stock->company_id, 'MOV'),
                    'stock_id' => $stock->id,
                    'stock_lot_id' => $lot->id,
                    'date_mouvement' => $stock->created_at ?? now(),
                    'quantite' => $stock->quantite_actuelle,
                    'type_mouvement' => 'Entrée',
                    'prix_unitaire_mouvement' => null,
                    'demande_id' => null,
                    'motif' => 'Migration des données existantes vers système FIFO',
                ]);
            }

            // 4. Mettre à jour les mouvements existants qui n'ont pas de stock_lot_id
            $orphanMovements = StockMovement::whereNull('stock_lot_id')->get();

            foreach ($orphanMovements as $movement) {
                // Essayer de trouver le lot correspondant pour ce stock
                $lot = StockLot::where('article_id', $movement->stock->article_id)
                    ->where('company_id', $movement->company_id)
                    ->where('numero_lot', 'LIKE', 'MIGRATION-%')
                    ->first();

                if ($lot) {
                    $movement->update(['stock_lot_id' => $lot->id]);
                }
            }

            if (isset($this->command)) {
                $this->command->info('Migration FIFO terminée : ' . $stocks->count() . ' stocks convertis en lots');
            }
        });
    }

    public function down(): void
    {
        // Attention : Cette opération est destructive et ne peut pas être complètement inversée
        DB::transaction(function () {
            // Supprimer les lots créés lors de la migration
            StockLot::where('numero_lot', 'LIKE', 'MIGRATION-%')->delete();

            // Remettre à null les stock_lot_id des mouvements
            StockMovement::whereNotNull('stock_lot_id')->update(['stock_lot_id' => null]);

            if (isset($this->command)) {
                $this->command->warn('Rollback de la migration FIFO effectué. Certaines données peuvent être perdues.');
            }
        });
    }
};
