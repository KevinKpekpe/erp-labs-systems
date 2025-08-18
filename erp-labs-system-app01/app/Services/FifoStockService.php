<?php

namespace App\Services;

use App\Models\Stock;
use App\Models\StockLot;
use App\Models\StockMovement;
use App\Support\CodeGenerator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Collection;

class FifoStockService
{
    /**
     * Traite une sortie de stock en utilisant la méthode FIFO
     */
    public function processFifoExit(Stock $stock, int $quantiteDemandee, array $options = []): Collection
    {
        $movements = collect();

        DB::transaction(function () use ($stock, $quantiteDemandee, $options, &$movements) {
            $lotsDisponibles = StockLot::forCompany($stock->company_id)
                ->forArticle($stock->article_id)
                ->available()
                ->fifoOrder()
                ->lockForUpdate()
                ->get();

            $quantiteRestante = $quantiteDemandee;

            if ($lotsDisponibles->sum('quantite_restante') < $quantiteDemandee) {
                throw new \InvalidArgumentException("Stock insuffisant. Disponible: {$lotsDisponibles->sum('quantite_restante')}, Demandé: {$quantiteDemandee}");
            }

            foreach ($lotsDisponibles as $lot) {
                if ($quantiteRestante <= 0) break;

                $quantiteAPreler = min($quantiteRestante, $lot->quantite_restante);

                // Consommer le lot
                $lot->consume($quantiteAPreler);
                $lot->save();

                // Créer le mouvement
                $movement = $this->createMovement([
                    'company_id' => $stock->company_id,
                    'stock_id' => $stock->id,
                    'stock_lot_id' => $lot->id,
                    'quantite' => $quantiteAPreler,
                    'type_mouvement' => 'Sortie',
                    'prix_unitaire_mouvement' => $lot->prix_unitaire_achat,
                    'date_mouvement' => $options['date_mouvement'] ?? now(),
                    'motif' => $options['motif'] ?? 'Sortie FIFO',
                    'demande_id' => $options['demande_id'] ?? null,
                ]);

                $movements->push($movement);
                $quantiteRestante -= $quantiteAPreler;
            }

            // Mettre à jour la quantité actuelle du stock (pour compatibilité)
            $stock->quantite_actuelle = $stock->quantite_actuelle_calculee;
            $stock->save();
        });

        return $movements;
    }

    /**
     * Traite une sortie de stock en utilisant la méthode FEFO (First Expired, First Out)
     */
    public function processFefoExit(Stock $stock, int $quantiteDemandee, array $options = []): Collection
    {
        $movements = collect();

        DB::transaction(function () use ($stock, $quantiteDemandee, $options, &$movements) {
            $lotsDisponibles = StockLot::forCompany($stock->company_id)
                ->forArticle($stock->article_id)
                ->available()
                ->fefoOrder()
                ->lockForUpdate()
                ->get();

            $quantiteRestante = $quantiteDemandee;

            if ($lotsDisponibles->sum('quantite_restante') < $quantiteDemandee) {
                throw new \InvalidArgumentException("Stock insuffisant. Disponible: {$lotsDisponibles->sum('quantite_restante')}, Demandé: {$quantiteDemandee}");
            }

            foreach ($lotsDisponibles as $lot) {
                if ($quantiteRestante <= 0) break;

                $quantiteAPreler = min($quantiteRestante, $lot->quantite_restante);

                $lot->consume($quantiteAPreler);
                $lot->save();

                $movement = $this->createMovement([
                    'company_id' => $stock->company_id,
                    'stock_id' => $stock->id,
                    'stock_lot_id' => $lot->id,
                    'quantite' => $quantiteAPreler,
                    'type_mouvement' => 'Sortie',
                    'prix_unitaire_mouvement' => $lot->prix_unitaire_achat,
                    'date_mouvement' => $options['date_mouvement'] ?? now(),
                    'motif' => $options['motif'] ?? 'Sortie FEFO',
                    'demande_id' => $options['demande_id'] ?? null,
                ]);

                $movements->push($movement);
                $quantiteRestante -= $quantiteAPreler;
            }

            $stock->quantite_actuelle = $stock->quantite_actuelle_calculee;
            $stock->save();
        });

        return $movements;
    }

    /**
     * Traite une sortie manuelle avec sélection de lots spécifiques
     */
    public function processManualExit(Stock $stock, array $lotsManuels, array $options = []): Collection
    {
        $movements = collect();

        DB::transaction(function () use ($stock, $lotsManuels, $options, &$movements) {
            foreach ($lotsManuels as $lotManuel) {
                $lot = StockLot::forCompany($stock->company_id)
                    ->lockForUpdate()
                    ->findOrFail($lotManuel['lot_id']);

                if ($lot->article_id !== $stock->article_id) {
                    throw new \InvalidArgumentException("Le lot {$lot->code} n'appartient pas à l'article {$stock->article->nom_article}");
                }

                $quantite = $lotManuel['quantite'];

                if (!$lot->canProvide($quantite)) {
                    throw new \InvalidArgumentException("Le lot {$lot->code} ne peut fournir {$quantite} unités. Disponible: {$lot->quantite_restante}");
                }

                $lot->consume($quantite);
                $lot->save();

                $movement = $this->createMovement([
                    'company_id' => $stock->company_id,
                    'stock_id' => $stock->id,
                    'stock_lot_id' => $lot->id,
                    'quantite' => $quantite,
                    'type_mouvement' => 'Sortie',
                    'prix_unitaire_mouvement' => $lot->prix_unitaire_achat,
                    'date_mouvement' => $options['date_mouvement'] ?? now(),
                    'motif' => $options['motif'] ?? 'Sortie manuelle',
                    'demande_id' => $options['demande_id'] ?? null,
                ]);

                $movements->push($movement);
            }

            $stock->quantite_actuelle = $stock->quantite_actuelle_calculee;
            $stock->save();
        });

        return $movements;
    }

    /**
     * Traite une entrée de stock (création d'un nouveau lot)
     */
    public function processStockEntry(Stock $stock, array $lotData): StockLot
    {
        return DB::transaction(function () use ($stock, $lotData) {
            $lot = StockLot::create([
                'company_id' => $stock->company_id,
                'code' => CodeGenerator::generate('stock_lots', $stock->company_id, 'LOT'),
                'article_id' => $stock->article_id,
                'quantite_initiale' => $lotData['quantite_initiale'],
                'quantite_restante' => $lotData['quantite_initiale'],
                'date_entree' => $lotData['date_entree'] ?? now(),
                'date_expiration' => $lotData['date_expiration'] ?? null,
                'prix_unitaire_achat' => $lotData['prix_unitaire_achat'] ?? null,
                'numero_lot' => $lotData['numero_lot'] ?? null,
                'fournisseur_lot' => $lotData['fournisseur_lot'] ?? null,
                'commentaire' => $lotData['commentaire'] ?? null,
            ]);

            // Créer le mouvement d'entrée
            $this->createMovement([
                'company_id' => $stock->company_id,
                'stock_id' => $stock->id,
                'stock_lot_id' => $lot->id,
                'quantite' => $lot->quantite_initiale,
                'type_mouvement' => 'Entrée',
                'prix_unitaire_mouvement' => $lot->prix_unitaire_achat,
                'date_mouvement' => $lot->date_entree,
                'motif' => 'Entrée nouveau lot',
            ]);

            // Mettre à jour la quantité actuelle du stock
            $stock->quantite_actuelle = $stock->quantite_actuelle_calculee;
            $stock->save();

            return $lot;
        });
    }

    /**
     * Crée un mouvement de stock
     */
    private function createMovement(array $data): StockMovement
    {
        return StockMovement::create([
            'company_id' => $data['company_id'],
            'code' => CodeGenerator::generate('mouvement_stocks', $data['company_id'], 'MOV'),
            'stock_id' => $data['stock_id'],
            'stock_lot_id' => $data['stock_lot_id'],
            'date_mouvement' => $data['date_mouvement'],
            'quantite' => $data['quantite'],
            'type_mouvement' => $data['type_mouvement'],
            'prix_unitaire_mouvement' => $data['prix_unitaire_mouvement'],
            'demande_id' => $data['demande_id'] ?? null,
            'motif' => $data['motif'],
        ]);
    }

    /**
     * Obtient un aperçu des lots disponibles pour un stock
     */
    public function getStockLotsOverview(Stock $stock): array
    {
        $lots = StockLot::forCompany($stock->company_id)
            ->forArticle($stock->article_id)
            ->available()
            ->with('movements')
            ->get();

        return [
            'quantite_totale' => $lots->sum('quantite_restante'),
            'valeur_totale' => $lots->sum(function($lot) {
                return $lot->quantite_restante * ($lot->prix_unitaire_achat ?? 0);
            }),
            'nombre_lots' => $lots->count(),
            'lots_expires' => $lots->filter->isExpired()->count(),
            'lots_proche_expiration' => $lots->filter->isNearExpiration()->count(),
            'lot_plus_ancien' => $lots->sortBy('date_entree')->first(),
            'lot_expire_bientot' => $lots->filter(function($lot) {
                return $lot->date_expiration && !$lot->isExpired();
            })->sortBy('date_expiration')->first(),
        ];
    }
}
