<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('factures', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('companies');
            $table->string('code', 50)->unique();
            $table->foreignId('demande_id')->unique()->constrained('demande_examens');
            $table->foreignId('patient_id')->constrained('patients');
            $table->dateTime('date_facture');
            $table->decimal('montant_total', 12, 2);
            $table->enum('statut_facture', ['En attente de paiement', 'Payée', 'Annulée', 'Partiellement payée']);
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('facture_details', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('companies');
            $table->string('code', 50)->unique();
            $table->foreignId('facture_id')->constrained('factures')->onDelete('cascade');
            $table->foreignId('examen_id')->constrained('examens');
            $table->decimal('prix_unitaire_facture', 10, 2);
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('paiements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('companies');
            $table->string('code', 50)->unique();
            $table->foreignId('facture_id')->constrained('factures');
            $table->dateTime('date_paiement');
            $table->decimal('montant_paye', 12, 2);
            $table->enum('methode_paiement', ['Carte bancaire', 'Caisse', 'Assurance']);
            $table->string('reference_paiement', 100)->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('paiements');
        Schema::dropIfExists('facture_details');
        Schema::dropIfExists('factures');
    }
};


