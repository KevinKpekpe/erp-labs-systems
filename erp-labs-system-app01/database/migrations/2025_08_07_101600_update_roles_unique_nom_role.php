<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('roles', function (Blueprint $table) {
            // Supprimer l'unique global sur nom_role si présent
            try {
                $table->dropUnique('roles_nom_role_unique');
            } catch (\Throwable $e) {
                // ignore si non existant
            }
            // Ajouter une contrainte unique par company
            $table->unique(['company_id', 'nom_role'], 'roles_company_nom_unique');
        });
    }

    public function down(): void
    {
        Schema::table('roles', function (Blueprint $table) {
            try {
                $table->dropUnique('roles_company_nom_unique');
            } catch (\Throwable $e) {
                // ignore
            }
            // Remettre l'unique global (optionnel)
            $table->unique('nom_role', 'roles_nom_role_unique');
        });
    }
};


