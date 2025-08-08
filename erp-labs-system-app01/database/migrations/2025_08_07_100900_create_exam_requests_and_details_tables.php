<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('demande_examens', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('companies');
            $table->string('code', 50)->unique();
            $table->foreignId('patient_id')->constrained('patients');
            $table->foreignId('medecin_prescripteur_id')->nullable()->constrained('medecins');
            $table->string('medecin_prescripteur_externe_nom', 100)->nullable();
            $table->string('medecin_prescripteur_externe_prenom', 100)->nullable();
            $table->dateTime('date_demande');
            $table->enum('statut_demande', ['En attente', 'En cours', 'Terminée', 'Annulée']);
            $table->text('note')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('demande_examen_details', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('companies');
            $table->string('code', 50)->unique();
            $table->foreignId('demande_id')->constrained('demande_examens')->onDelete('cascade');
            $table->foreignId('examen_id')->constrained('examens');
            $table->text('resultat')->nullable();
            $table->dateTime('date_resultat')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('demande_examen_details');
        Schema::dropIfExists('demande_examens');
    }
};


