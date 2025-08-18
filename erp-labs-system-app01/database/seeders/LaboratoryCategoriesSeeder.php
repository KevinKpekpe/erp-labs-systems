<?php

namespace Database\Seeders;

use App\Models\CategoryArticle;
use App\Support\CodeGenerator;
use Illuminate\Database\Seeder;

class LaboratoryCategoriesSeeder extends Seeder
{
    /**
     * Seeder des catégories d'articles typiques d'un laboratoire hospitalier
     */
    public function run(): void
    {
        $companyId = 1; // Adapter selon vos besoins

        $categories = [
            // Réactifs
            [
                'nom_categorie' => 'Réactifs Biochimie',
                'type_laboratoire' => 'Réactifs',
                'conditions_stockage_requises' => 'Réfrigération +2°C à +8°C, à l\'abri de la lumière',
                'temperature_stockage_min' => 2.0,
                'temperature_stockage_max' => 8.0,
                'humidite_max' => 60.0,
                'sensible_lumiere' => true,
                'chaine_froid_critique' => true,
                'delai_alerte_expiration' => 15,
            ],
            [
                'nom_categorie' => 'Réactifs Hématologie',
                'type_laboratoire' => 'Réactifs',
                'conditions_stockage_requises' => 'Température ambiante +15°C à +25°C',
                'temperature_stockage_min' => 15.0,
                'temperature_stockage_max' => 25.0,
                'humidite_max' => 65.0,
                'sensible_lumiere' => false,
                'chaine_froid_critique' => false,
                'delai_alerte_expiration' => 30,
            ],
            [
                'nom_categorie' => 'Réactifs Immunologie',
                'type_laboratoire' => 'Réactifs',
                'conditions_stockage_requises' => 'Réfrigération +2°C à +8°C, ne pas congeler',
                'temperature_stockage_min' => 2.0,
                'temperature_stockage_max' => 8.0,
                'humidite_max' => 60.0,
                'sensible_lumiere' => true,
                'chaine_froid_critique' => true,
                'delai_alerte_expiration' => 7,
            ],

            // Consommables
            [
                'nom_categorie' => 'Tubes et Contenants',
                'type_laboratoire' => 'Consommables',
                'conditions_stockage_requises' => 'Stockage sec, température ambiante',
                'temperature_stockage_min' => 10.0,
                'temperature_stockage_max' => 30.0,
                'humidite_max' => 70.0,
                'sensible_lumiere' => false,
                'chaine_froid_critique' => false,
                'delai_alerte_expiration' => 90,
            ],
            [
                'nom_categorie' => 'Pipettes et Embouts',
                'type_laboratoire' => 'Consommables',
                'conditions_stockage_requises' => 'Stockage sec, dans emballage d\'origine',
                'temperature_stockage_min' => 10.0,
                'temperature_stockage_max' => 35.0,
                'humidite_max' => 75.0,
                'sensible_lumiere' => false,
                'chaine_froid_critique' => false,
                'delai_alerte_expiration' => 120,
            ],

            // Contrôles Qualité
            [
                'nom_categorie' => 'Contrôles Normaux',
                'type_laboratoire' => 'Contrôles',
                'conditions_stockage_requises' => 'Réfrigération +2°C à +8°C, usage unique',
                'temperature_stockage_min' => 2.0,
                'temperature_stockage_max' => 8.0,
                'humidite_max' => 60.0,
                'sensible_lumiere' => true,
                'chaine_froid_critique' => true,
                'delai_alerte_expiration' => 5,
            ],
            [
                'nom_categorie' => 'Contrôles Pathologiques',
                'type_laboratoire' => 'Contrôles',
                'conditions_stockage_requises' => 'Réfrigération +2°C à +8°C, usage unique',
                'temperature_stockage_min' => 2.0,
                'temperature_stockage_max' => 8.0,
                'humidite_max' => 60.0,
                'sensible_lumiere' => true,
                'chaine_froid_critique' => true,
                'delai_alerte_expiration' => 5,
            ],

            // Kits de diagnostic
            [
                'nom_categorie' => 'Kits Immunoenzymatiques',
                'type_laboratoire' => 'Kits',
                'conditions_stockage_requises' => 'Réfrigération +2°C à +8°C, composants séparés',
                'temperature_stockage_min' => 2.0,
                'temperature_stockage_max' => 8.0,
                'humidite_max' => 60.0,
                'sensible_lumiere' => true,
                'chaine_froid_critique' => true,
                'delai_alerte_expiration' => 14,
            ],

            // Références et Étalons
            [
                'nom_categorie' => 'Étalons Primaires',
                'type_laboratoire' => 'Références',
                'conditions_stockage_requises' => 'Stockage spécialisé selon certificat',
                'temperature_stockage_min' => -20.0,
                'temperature_stockage_max' => 25.0,
                'humidite_max' => 50.0,
                'sensible_lumiere' => true,
                'chaine_froid_critique' => true,
                'delai_alerte_expiration' => 30,
            ],

            // Équipements
            [
                'nom_categorie' => 'Instruments de Mesure',
                'type_laboratoire' => 'Équipements',
                'conditions_stockage_requises' => 'Stockage sec, dans étui de protection',
                'temperature_stockage_min' => 5.0,
                'temperature_stockage_max' => 40.0,
                'humidite_max' => 80.0,
                'sensible_lumiere' => false,
                'chaine_froid_critique' => false,
                'delai_alerte_expiration' => 365,
            ],
        ];

        foreach ($categories as $categoryData) {
            CategoryArticle::create([
                'company_id' => $companyId,
                'code' => CodeGenerator::generate('categorie_articles', $companyId, 'CAT'),
                'nom_categorie' => $categoryData['nom_categorie'],
                'type_laboratoire' => $categoryData['type_laboratoire'],
                'conditions_stockage_requises' => $categoryData['conditions_stockage_requises'],
                'temperature_stockage_min' => $categoryData['temperature_stockage_min'],
                'temperature_stockage_max' => $categoryData['temperature_stockage_max'],
                'humidite_max' => $categoryData['humidite_max'],
                'sensible_lumiere' => $categoryData['sensible_lumiere'],
                'chaine_froid_critique' => $categoryData['chaine_froid_critique'],
                'delai_alerte_expiration' => $categoryData['delai_alerte_expiration'],
            ]);
        }

        $this->command->info('✅ Catégories de laboratoire créées avec succès !');
    }
}
