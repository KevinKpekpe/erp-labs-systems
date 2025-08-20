<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('type_patients', function (Blueprint $table) {
            // Supprimer l'unique global sur nom_type si présent
            try { $table->dropUnique('type_patients_nom_type_unique'); } catch (\Throwable $e) { /* ignore */ }
            // Ajouter un unique composite par compagnie (et compatible soft delete)
            try { $table->unique(['company_id', 'nom_type', 'deleted_at'], 'tp_company_nom_deleted_unique'); } catch (\Throwable $e) { /* ignore */ }
        });
    }

    public function down(): void
    {
        Schema::table('type_patients', function (Blueprint $table) {
            // Revenir à l'index unique original (global) si nécessaire
            try { $table->dropUnique('tp_company_nom_deleted_unique'); } catch (\Throwable $e) { /* ignore */ }
            try { $table->unique('nom_type'); } catch (\Throwable $e) { /* ignore */ }
        });
    }
};


