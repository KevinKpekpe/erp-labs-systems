<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('categorie_articles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('companies');
            $table->string('code', 50)->unique();
            $table->string('nom_categorie', 100)->unique();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('articles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('companies');
            $table->string('code', 50)->unique();
            $table->foreignId('categorie_id')->constrained('categorie_articles');
            $table->string('nom_article', 255);
            $table->text('description')->nullable();
            $table->string('fournisseur', 255)->nullable();
            $table->decimal('prix_unitaire', 10, 2);
            $table->string('unite_mesure', 50);
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('stocks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('companies');
            $table->string('code', 50)->unique();
            $table->foreignId('article_id')->constrained('articles');
            $table->integer('quantite_actuelle');
            $table->integer('seuil_critique');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('stocks');
        Schema::dropIfExists('articles');
        Schema::dropIfExists('categorie_articles');
    }
};


