<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Ajoute les extensions spécifiques au laboratoire hospitalier
     * aux catégories d'articles existantes (avec vérifications)
     */
    public function up(): void
    {
        Schema::table('categorie_articles', function (Blueprint $table) {
            // Vérifier et ajouter les colonnes uniquement si elles n'existent pas
            if (!Schema::hasColumn('categorie_articles', 'type_laboratoire')) {
                $table->enum('type_laboratoire', [
                    'Réactifs',
                    'Consommables',
                    'Équipements',
                    'Contrôles',
                    'Références',
                    'Kits',
                    'Autre'
                ])->nullable()->after('nom_categorie');
            }

            if (!Schema::hasColumn('categorie_articles', 'conditions_stockage_requises')) {
                $table->text('conditions_stockage_requises')->nullable()->after('type_laboratoire');
            }

            if (!Schema::hasColumn('categorie_articles', 'temperature_stockage_min')) {
                $table->decimal('temperature_stockage_min', 5, 2)->nullable()->after('conditions_stockage_requises');
            }

            if (!Schema::hasColumn('categorie_articles', 'temperature_stockage_max')) {
                $table->decimal('temperature_stockage_max', 5, 2)->nullable()->after('temperature_stockage_min');
            }

            if (!Schema::hasColumn('categorie_articles', 'humidite_max')) {
                $table->decimal('humidite_max', 5, 2)->nullable()->after('temperature_stockage_max');
            }

            if (!Schema::hasColumn('categorie_articles', 'sensible_lumiere')) {
                $table->boolean('sensible_lumiere')->default(false)->after('humidite_max');
            }

            if (!Schema::hasColumn('categorie_articles', 'chaine_froid_critique')) {
                $table->boolean('chaine_froid_critique')->default(false)->after('sensible_lumiere');
            }

            if (!Schema::hasColumn('categorie_articles', 'delai_alerte_expiration')) {
                $table->integer('delai_alerte_expiration')->default(30)->after('chaine_froid_critique');
            }
        });

        // Ajouter des index pour les performances (seulement si les colonnes existent)
        if (Schema::hasColumn('categorie_articles', 'type_laboratoire')) {
            Schema::table('categorie_articles', function (Blueprint $table) {
                try {
                    $table->index('type_laboratoire', 'idx_cat_type_lab');
                } catch (\Exception $e) {
                    // Index existe déjà, continuer
                }
            });
        }

        if (Schema::hasColumn('categorie_articles', 'chaine_froid_critique')) {
            Schema::table('categorie_articles', function (Blueprint $table) {
                try {
                    $table->index('chaine_froid_critique', 'idx_cat_chaine_froid');
                } catch (\Exception $e) {
                    // Index existe déjà, continuer
                }
            });
        }

        if (Schema::hasColumn('categorie_articles', 'temperature_stockage_min') &&
            Schema::hasColumn('categorie_articles', 'temperature_stockage_max')) {
            Schema::table('categorie_articles', function (Blueprint $table) {
                try {
                    $table->index(['temperature_stockage_min', 'temperature_stockage_max'], 'idx_cat_temperature');
                } catch (\Exception $e) {
                    // Index existe déjà, continuer
                }
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('categorie_articles', function (Blueprint $table) {
            // Supprimer les index
            try {
                $table->dropIndex('idx_cat_type_lab');
            } catch (\Exception $e) {
                // Index n'existe pas, continuer
            }

            try {
                $table->dropIndex('idx_cat_chaine_froid');
            } catch (\Exception $e) {
                // Index n'existe pas, continuer
            }

            try {
                $table->dropIndex('idx_cat_temperature');
            } catch (\Exception $e) {
                // Index n'existe pas, continuer
            }

            // Supprimer les colonnes si elles existent
            $columnsToRemove = [
                'delai_alerte_expiration',
                'chaine_froid_critique',
                'sensible_lumiere',
                'humidite_max',
                'temperature_stockage_max',
                'temperature_stockage_min',
                'conditions_stockage_requises',
                'type_laboratoire'
            ];

            foreach ($columnsToRemove as $column) {
                if (Schema::hasColumn('categorie_articles', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
