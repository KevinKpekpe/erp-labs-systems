<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('mouvement_stocks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('companies');
            $table->string('code', 50)->unique();
            $table->foreignId('stock_id')->constrained('stocks');
            $table->dateTime('date_mouvement');
            $table->integer('quantite');
            $table->enum('type_mouvement', ['Entrée', 'Sortie']);
            $table->foreignId('demande_id')->nullable()->constrained('demande_examens');
            $table->text('motif')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('alerte_stocks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('companies');
            $table->string('code', 50)->unique();
            $table->foreignId('stock_id')->constrained('stocks');
            $table->dateTime('date_alerte');
            $table->integer('quantite_actuelle');
            $table->integer('seuil_critique');
            $table->text('message_alerte');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('alerte_stocks');
        Schema::dropIfExists('mouvement_stocks');
    }
};


