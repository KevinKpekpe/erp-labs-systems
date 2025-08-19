<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\StockAlert;
use App\Models\Stock;
use App\Models\StockLot;
use App\Models\Company;
use App\Support\CodeGenerator;

class StockAlertsSeeder extends Seeder
{
    public function run(): void
    {
        // Récupérer la première compagnie (ou créer une si nécessaire)
        $company = Company::first();
        if (!$company) {
            $this->command->error('Aucune compagnie trouvée. Créez d\'abord une compagnie.');
            return;
        }

        $this->command->info("Création d'alertes pour la compagnie: {$company->nom}");

        // Créer des alertes de test
        $alerts = [
            [
                'type' => StockAlert::TYPE_STOCK_CRITIQUE,
                'priorite' => StockAlert::PRIORITE_HAUTE,
                'titre' => 'Stock critique détecté',
                'message' => 'Le stock de Réactifs Biochimie est sous le seuil critique (5 unités restantes)',
                'stock_id' => 1, // Sera mis à jour si le stock existe
                'statut' => StockAlert::STATUT_NOUVEAU,
            ],
            [
                'type' => StockAlert::TYPE_EXPIRATION_PROCHE,
                'priorite' => StockAlert::PRIORITE_MOYENNE,
                'titre' => 'Expiration proche',
                'message' => 'Le lot LOT-2024-001 expire dans 7 jours',
                'lot_id' => 1, // Sera mis à jour si le lot existe
                'statut' => StockAlert::STATUT_NOUVEAU,
            ],
            [
                'type' => StockAlert::TYPE_CHAINE_FROID,
                'priorite' => StockAlert::PRIORITE_HAUTE,
                'titre' => 'Alerte chaîne du froid',
                'message' => 'Rupture de la chaîne du froid détectée pour les réactifs critiques',
                'stock_id' => 2, // Sera mis à jour si le stock existe
                'statut' => StockAlert::STATUT_EN_COURS,
            ],
            [
                'type' => StockAlert::TYPE_TEMPERATURE,
                'priorite' => StockAlert::PRIORITE_FAIBLE,
                'titre' => 'Température hors norme',
                'message' => 'La température de stockage dépasse les limites recommandées',
                'stock_id' => 3, // Sera mis à jour si le stock existe
                'statut' => StockAlert::STATUT_NOUVEAU,
            ],
        ];

        foreach ($alerts as $alertData) {
            // Vérifier si le stock existe
            if (isset($alertData['stock_id'])) {
                $stock = Stock::where('company_id', $company->id)->find($alertData['stock_id']);
                if (!$stock) {
                    $this->command->warn("Stock ID {$alertData['stock_id']} non trouvé, création d'une alerte générique");
                    $alertData['stock_id'] = null;
                }
            }

            // Vérifier si le lot existe
            if (isset($alertData['lot_id'])) {
                $lot = StockLot::where('company_id', $company->id)->find($alertData['lot_id']);
                if (!$lot) {
                    $this->command->warn("Lot ID {$alertData['lot_id']} non trouvé, création d'une alerte générique");
                    $alertData['lot_id'] = null;
                }
            }

            StockAlert::create([
                'company_id' => $company->id,
                'code' => CodeGenerator::generate('alerte_stocks', $company->id, 'ALT'),
                'type' => $alertData['type'],
                'priorite' => $alertData['priorite'],
                'titre' => $alertData['titre'],
                'message' => $alertData['message'],
                'stock_id' => $alertData['stock_id'] ?? null,
                'lot_id' => $alertData['lot_id'] ?? null,
                'date_alerte' => now()->subDays(rand(0, 5)),
                'statut' => $alertData['statut'],
                'quantite_actuelle' => rand(1, 10),
                'seuil_critique' => rand(5, 15),
                'message_alerte' => $alertData['message'],
            ]);
        }

        $this->command->info('Alertes de test créées avec succès !');
    }
}
