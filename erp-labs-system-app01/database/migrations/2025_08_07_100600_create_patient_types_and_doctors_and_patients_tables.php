<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('type_patients', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('companies');
            $table->string('code', 50)->unique();
            $table->string('nom_type', 100)->unique();
            $table->text('description')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('medecins', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('companies');
            $table->string('code', 50)->unique();
            $table->string('nom', 100);
            $table->string('prenom', 100);
            $table->date('date_naissance');
            $table->enum('sexe', ['M', 'F']);
            $table->string('contact', 100);
            $table->string('numero_identification', 100);
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('patients', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('companies');
            $table->string('code', 50)->unique();
            $table->string('nom', 100);
            $table->string('postnom', 100)->nullable();
            $table->string('prenom', 100);
            $table->string('email', 100)->nullable();
            $table->date('date_naissance');
            $table->enum('sexe', ['M', 'F']);
            $table->string('adresse', 255);
            $table->string('contact', 100);
            $table->foreignId('type_patient_id')->constrained('type_patients');
            $table->foreignId('medecin_resident_id')->nullable()->constrained('medecins');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('patients');
        Schema::dropIfExists('medecins');
        Schema::dropIfExists('type_patients');
    }
};


