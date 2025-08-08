<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('employes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('companies');
            $table->string('code', 50)->unique();
            $table->string('matricule', 50)->unique();
            $table->string('nom', 100);
            $table->string('postnom', 100)->nullable();
            $table->string('prenom', 100);
            $table->date('date_naissance');
            $table->enum('sexe', ['M', 'F']);
            $table->string('adresse', 255);
            $table->string('contact', 100);
            $table->string('poste', 100);
            $table->string('service', 100)->nullable();
            $table->date('date_embauche');
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('horaire_employes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('companies');
            $table->string('code', 50)->unique();
            $table->foreignId('employe_id')->constrained('employes')->onDelete('cascade');
            $table->date('date_horaire');
            $table->enum('type_horaire', ['Journalier', 'Par heure']);
            $table->time('heure_debut')->nullable();
            $table->time('heure_fin')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('presence_employes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('companies');
            $table->string('code', 50)->unique();
            $table->foreignId('employe_id')->constrained('employes')->onDelete('cascade');
            $table->date('date_presence');
            $table->time('heure_entree');
            $table->time('heure_sortie')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('presence_employes');
        Schema::dropIfExists('horaire_employes');
        Schema::dropIfExists('employes');
    }
};


