<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use App\Models\Company;
use App\Models\Role;
use App\Models\User;
use App\Models\Permission;
use App\Support\CodeGenerator;

class RolesUsersSeeder extends Seeder
{
    public function run(): void
    {
        foreach (Company::all() as $company) {
            $adminRole = Role::create([
                'company_id' => $company->id,
                'code' => CodeGenerator::generate('roles', $company->id, 'ROLE'),
                'nom_role' => 'ADMIN',
            ]);
            $managerRole = Role::create([
                'company_id' => $company->id,
                'code' => CodeGenerator::generate('roles', $company->id, 'ROLE'),
                'nom_role' => 'MANAGER',
            ]);
            $techRole = Role::create([
                'company_id' => $company->id,
                'code' => CodeGenerator::generate('roles', $company->id, 'ROLE'),
                'nom_role' => 'TECH',
            ]);

            foreach (Permission::pluck('id') as $pid) {
                DB::table('role_permissions')->insert([
                    'company_id' => $company->id,
                    'code' => CodeGenerator::generate('role_permissions', $company->id, 'RP'),
                    'role_id' => $adminRole->id,
                    'permission_id' => $pid,
                ]);
            }

            $users = [];
            $users[] = User::create([
                'company_id' => $company->id,
                'code' => CodeGenerator::generate('users', $company->id, 'USR'),
                'username' => 'admin'.$company->code,
                'password' => Hash::make('Admin@1234'),
                'email' => 'admin'.$company->code.'@demo.tld',
                'is_active' => true,
                'must_change_password' => true,
            ]);
            $users[] = User::create([
                'company_id' => $company->id,
                'code' => CodeGenerator::generate('users', $company->id, 'USR'),
                'username' => 'manager'.$company->code,
                'password' => Hash::make('Manager@1234'),
                'email' => 'manager'.$company->code.'@demo.tld',
                'is_active' => true,
                'must_change_password' => true,
            ]);
            $users[] = User::create([
                'company_id' => $company->id,
                'code' => CodeGenerator::generate('users', $company->id, 'USR'),
                'username' => 'tech'.$company->code,
                'password' => Hash::make('Tech@1234'),
                'email' => 'tech'.$company->code.'@demo.tld',
                'is_active' => true,
                'must_change_password' => true,
            ]);

            DB::table('user_roles')->insert([
                'company_id' => $company->id,
                'code' => CodeGenerator::generate('user_roles', $company->id, 'UR'),
                'user_id' => $users[0]->id,
                'role_id' => $adminRole->id,
            ]);
            DB::table('user_roles')->insert([
                'company_id' => $company->id,
                'code' => CodeGenerator::generate('user_roles', $company->id, 'UR'),
                'user_id' => $users[1]->id,
                'role_id' => $managerRole->id,
            ]);
            DB::table('user_roles')->insert([
                'company_id' => $company->id,
                'code' => CodeGenerator::generate('user_roles', $company->id, 'UR'),
                'user_id' => $users[2]->id,
                'role_id' => $techRole->id,
            ]);
        }
    }
}


