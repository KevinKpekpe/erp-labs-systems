<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('companies');
            $table->string('code', 50)->unique();
            $table->string('username', 100)->unique();
            $table->string('password', 255);
            $table->string('email', 255)->unique();
            $table->string('telephone', 50)->nullable();
            $table->enum('sexe', ['M', 'F'])->nullable();
            $table->string('photo_de_profil', 255)->nullable();
            $table->dateTime('last_login')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};


