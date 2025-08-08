<?php

namespace Database\Seeders;

use App\Models\SuperAdmin;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class SuperAdminSeeder extends Seeder
{
    public function run(): void
    {
        SuperAdmin::updateOrCreate(
            ['username' => 'superadmin'],
            [
                'code' => 'SA-001',
                'email' => 'superadmin@example.com',
                'password' => Hash::make('Admin@1234'),
                'is_active' => true,
            ]
        );
    }
}


