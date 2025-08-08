<?php

namespace App\Http\Controllers\Api\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Http\Requests\SuperAdmin\CompanyStoreRequest;
use App\Http\Requests\SuperAdmin\CompanyUpdateRequest;
use App\Mail\AdminWelcome;
use App\Models\Company;
use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use App\Support\ApiResponse;
use App\Support\CodeGenerator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class CompanyController extends Controller
{
    public function index()
    {
        $companies = Company::orderBy('id', 'desc')->get();
        return ApiResponse::success($companies, 'auth.me_success');
    }

    public function store(CompanyStoreRequest $request)
    {
        $data = $request->validated();

        try {
            $company = DB::transaction(function () use ($data) {
            // 1) Créer la compagnie (code auto via trigger MySQL si activé)
            $company = Company::create([
                'nom_company' => $data['nom_company'],
                'adresse' => $data['adresse'],
                'email' => $data['email'] ?? null,
                'contact' => $data['contact'],
                'logo' => null,
                'secteur_activite' => $data['secteur_activite'] ?? null,
                'type_etablissement' => $data['type_etablissement'],
                'description' => $data['description'] ?? null,
            ]);

            // Si le code n'a pas été défini (ex: pas de trigger), générer un code ENTIER depuis la séquence
            if (is_null($company->code)) {
                $seq = DB::table('company_code_sequence')->where('id', 1)->lockForUpdate()->first();
                if (!$seq) {
                    DB::table('company_code_sequence')->insert([
                        'id' => 1,
                        'next_code' => 100,
                    ]);
                    $next = 100;
                } else {
                    $next = (int) $seq->next_code;
                }
                DB::table('company_code_sequence')->where('id', 1)->update([
                    'next_code' => $next + 1,
                ]);
                $company->update(['code' => $next]);
            }

            // 2) Créer le rôle admin pour la compagnie
            $roleAdmin = Role::create([
                'company_id' => $company->id,
                'code' => CodeGenerator::generate('roles', $company->id, 'ROLE'),
                'nom_role' => 'ADMIN',
            ]);

            // 3) Donner toutes les permissions au rôle admin (sur cette compagnie)
            $permissions = Permission::all('id');
            $pivot = [];
            foreach ($permissions as $p) {
                $pivot[] = [
                    'company_id' => $company->id,
                    'code' => 'RP_'.$roleAdmin->id.'_'.$p->id,
                    'role_id' => $roleAdmin->id,
                    'permission_id' => $p->id,
                ];
            }
            if (!empty($pivot)) {
                DB::table('role_permissions')->insert($pivot);
            }

            // 4) Créer l'utilisateur admin avec must_change_password
            $tempPassword = 'Admin@'.random_int(1000, 9999);
            $user = User::create([
                'company_id' => $company->id,
                'code' => CodeGenerator::generate('users', $company->id, 'USR'),
                'username' => $data['admin_username'],
                'password' => Hash::make($tempPassword),
                'email' => $data['admin_email'],
                'is_active' => true,
                'must_change_password' => true,
            ]);

            // 5) Assigner le rôle admin à l'utilisateur
            DB::table('user_roles')->insert([
                'company_id' => $company->id,
                'code' => CodeGenerator::generate('user_roles', $company->id, 'UR'),
                'user_id' => $user->id,
                'role_id' => $roleAdmin->id,
            ]);

            // 6) Envoyer un email à l'admin
            Mail::to($user->email)->send(new AdminWelcome($company, $user->username, $user->email, $tempPassword));

            return $company->fresh();
        });
        } catch (\Throwable $e) {
            Log::error('Company creation failed', [
                'exception' => get_class($e),
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
            ]);
            return ApiResponse::error('errors.unexpected', 500, 'COMPANY_CREATE_FAILED');
        }

        return ApiResponse::success($company, 'company.created', [], 201);
    }

    public function update(CompanyUpdateRequest $request, Company $company)
    {
        $data = $request->validated();

        $payload = [];
        foreach (['nom_company','adresse','email','contact','secteur_activite','type_etablissement','description'] as $f) {
            if ($request->has($f)) {
                $payload[$f] = $request->input($f);
            }
        }

        if (($data['remove_logo'] ?? false) === true) {
            if ($company->logo && Storage::disk('public')->exists($company->logo)) {
                Storage::disk('public')->delete($company->logo);
            }
            $payload['logo'] = null;
        } elseif ($request->hasFile('logo')) {
            $path = $request->file('logo')->store('companies', 'public');
            if ($company->logo && Storage::disk('public')->exists($company->logo)) {
                Storage::disk('public')->delete($company->logo);
            }
            $payload['logo'] = $path;
        }

        $company->fill($payload)->save();

        return ApiResponse::success($company->fresh(), 'company.updated');
    }

    public function destroy(Company $company)
    {
        $company->delete();
        return ApiResponse::success(null, 'company.deleted');
    }

    public function trashed()
    {
        return ApiResponse::success(Company::onlyTrashed()->get(), 'company.trashed');
    }

    public function restore($id)
    {
        $company = Company::withTrashed()->findOrFail($id);
        $company->restore();
        return ApiResponse::success($company, 'company.restored');
    }

    public function forceDelete($id)
    {
        $company = Company::withTrashed()->findOrFail($id);
        $company->forceDelete();
        return ApiResponse::success(null, 'company.force_deleted');
    }
}


