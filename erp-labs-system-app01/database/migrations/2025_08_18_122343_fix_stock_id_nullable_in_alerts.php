<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('alerte_stocks', function (Blueprint $table) {
            // Supprimer la contrainte existante
            $table->dropForeign(['stock_id']);

            // Recréer la colonne comme nullable
            $table->foreignId('stock_id')->nullable()->change();

            // Recréer la contrainte
            $table->foreign('stock_id')->references('id')->on('stocks');
        });
    }

    public function down(): void
    {
        Schema::table('alerte_stocks', function (Blueprint $table) {
            // Supprimer la contrainte
            $table->dropForeign(['stock_id']);

            // Remettre la colonne comme non nullable
            $table->foreignId('stock_id')->nullable(false)->change();

            // Recréer la contrainte
            $table->foreign('stock_id')->references('id')->on('stocks');
        });
    }
};
