<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('alerte_stocks', function (Blueprint $table) {
            // Nouveaux champs pour un système d'alertes complet
            if (!Schema::hasColumn('alerte_stocks', 'lot_id')) {
                $table->foreignId('lot_id')->nullable()->constrained('stock_lots')->onDelete('cascade');
            }

            if (!Schema::hasColumn('alerte_stocks', 'type')) {
                $table->enum('type', ['stock_critique', 'expiration_proche', 'lot_expire', 'chaine_froid', 'temperature'])->default('stock_critique');
            }

            if (!Schema::hasColumn('alerte_stocks', 'priorite')) {
                $table->enum('priorite', ['haute', 'moyenne', 'faible'])->default('moyenne');
            }

            if (!Schema::hasColumn('alerte_stocks', 'titre')) {
                $table->string('titre', 255)->nullable();
            }

            if (!Schema::hasColumn('alerte_stocks', 'message')) {
                $table->text('message')->nullable();
            }

            if (!Schema::hasColumn('alerte_stocks', 'date_traitement')) {
                $table->dateTime('date_traitement')->nullable();
            }

            if (!Schema::hasColumn('alerte_stocks', 'statut')) {
                $table->enum('statut', ['nouveau', 'en_cours', 'traite', 'ignore'])->default('nouveau');
            }
        });

        // Ajouter des index pour améliorer les performances des filtres
        try {
            Schema::table('alerte_stocks', function (Blueprint $table) {
                $table->index(['type', 'priorite']);
                $table->index(['statut', 'date_alerte']);
                $table->index(['stock_id', 'lot_id']);
            });
        } catch (\Exception $e) {
            // Ignorer si les index existent déjà
        }
    }

    public function down(): void
    {
        Schema::table('alerte_stocks', function (Blueprint $table) {
            // Supprimer les index
            try {
                $table->dropIndex(['type', 'priorite']);
                $table->dropIndex(['statut', 'date_alerte']);
                $table->dropIndex(['stock_id', 'lot_id']);
            } catch (\Exception $e) {
                // Ignorer si les index n'existent pas
            }

            // Supprimer les colonnes
            $table->dropForeign(['lot_id']);
            $table->dropColumn([
                'lot_id',
                'type',
                'priorite',
                'titre',
                'message',
                'date_traitement',
                'statut'
            ]);
        });
    }
};
