<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('companies', function (Blueprint $table) {
            $table->id();
            $table->unsignedInteger('code')->unique()->nullable();
            $table->string('nom_company', 255);
            $table->string('adresse', 255);
            $table->string('email', 255)->nullable();
            $table->string('contact', 50);
            $table->string('logo', 255)->nullable();
            $table->string('secteur_activite', 100)->nullable();
            $table->enum('type_etablissement', ['Public', 'Privé', 'Universitaire']);
            $table->text('description')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('companies');
    }
};


