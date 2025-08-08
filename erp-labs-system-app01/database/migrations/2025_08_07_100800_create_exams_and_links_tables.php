<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('examens', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('companies');
            $table->string('code', 50)->unique();
            $table->string('nom_examen', 255);
            $table->text('description');
            $table->decimal('prix', 10, 2);
            $table->integer('delai_rendu_estime');
            $table->string('unites_mesure', 50);
            $table->text('valeurs_reference');
            $table->string('type_echantillon', 100);
            $table->text('conditions_pre_analytiques');
            $table->text('equipement_reactifs_necessaires')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('examen_articles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('companies');
            $table->foreignId('examen_id')->constrained('examens');
            $table->foreignId('article_id')->constrained('articles');
            $table->decimal('quantite_utilisee', 10, 2);
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('examen_articles');
        Schema::dropIfExists('examens');
    }
};


