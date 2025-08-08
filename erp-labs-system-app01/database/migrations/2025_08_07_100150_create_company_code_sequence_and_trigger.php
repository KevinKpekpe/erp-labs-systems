<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Table séquence portable (SQLite / MySQL)
        if (!Schema::hasTable('company_code_sequence')) {
            Schema::create('company_code_sequence', function (Blueprint $table) {
                $table->integer('id')->primary();
                $table->integer('next_code');
            });
        }

        // Initialiser à 100 si absent
        $exists = DB::table('company_code_sequence')->where('id', 1)->exists();
        if (!$exists) {
            DB::table('company_code_sequence')->insert([
                'id' => 1,
                'next_code' => 100,
            ]);
        }

        // Créer le trigger uniquement pour MySQL
        if (DB::getDriverName() === 'mysql') {
            DB::unprepared('DROP TRIGGER IF EXISTS trg_companies_set_code;');
            DB::unprepared(<<<SQL
                CREATE TRIGGER trg_companies_set_code
                BEFORE INSERT ON companies
                FOR EACH ROW
                BEGIN
                    DECLARE v_next_code INT;
                    SELECT next_code INTO v_next_code FROM company_code_sequence WHERE id = 1 FOR UPDATE;
                    SET NEW.code = COALESCE(NEW.code, v_next_code);
                    UPDATE company_code_sequence SET next_code = v_next_code + 1 WHERE id = 1;
                END;
            SQL);
        }
    }

    public function down(): void
    {
        if (DB::getDriverName() === 'mysql') {
            DB::unprepared('DROP TRIGGER IF EXISTS trg_companies_set_code;');
        }
        Schema::dropIfExists('company_code_sequence');
    }
};


