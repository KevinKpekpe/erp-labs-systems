<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('stock_lots', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('companies');
            $table->string('code', 50)->unique();
            $table->foreignId('article_id')->constrained('articles');
            $table->integer('quantite_initiale');
            $table->integer('quantite_restante');
            $table->dateTime('date_entree');
            $table->date('date_expiration')->nullable();
            $table->decimal('prix_unitaire_achat', 10, 2)->nullable();
            $table->string('numero_lot', 100)->nullable();
            $table->string('fournisseur_lot', 255)->nullable();
            $table->text('commentaire')->nullable();
            $table->timestamps();
            $table->softDeletes();

            // Index pour optimiser les requêtes FIFO
            $table->index(['article_id', 'date_entree']);
            $table->index(['article_id', 'date_expiration']);
            $table->index(['company_id', 'article_id', 'quantite_restante']);
        });

        // Modifier la table mouvement_stocks pour référencer les lots
        Schema::table('mouvement_stocks', function (Blueprint $table) {
            $table->foreignId('stock_lot_id')->nullable()->after('stock_id')->constrained('stock_lots');
            $table->decimal('prix_unitaire_mouvement', 10, 2)->nullable()->after('quantite');
        });
    }

    public function down(): void
    {
        Schema::table('mouvement_stocks', function (Blueprint $table) {
            $table->dropForeign(['stock_lot_id']);
            $table->dropColumn(['stock_lot_id', 'prix_unitaire_mouvement']);
        });

        Schema::dropIfExists('stock_lots');
    }
};
