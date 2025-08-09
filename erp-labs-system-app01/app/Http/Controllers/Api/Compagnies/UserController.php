<?php

namespace App\Http\Controllers\Api\Compagnies;

use App\Http\Controllers\Controller;
use App\Http\Requests\Compagnies\UserStoreRequest;
use App\Http\Requests\Compagnies\UserUpdateRequest;
use App\Models\Role;
use App\Models\User;
use App\Support\ApiResponse;
use App\Support\CodeGenerator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use App\Mail\UserWelcome;

class UserController extends Controller
{
    public function index()
    {
        $companyId = request()->user()->company_id;
        $users = User::where('company_id', $companyId)->orderBy('username')->get();
        return ApiResponse::success($users);
    }

    public function store(UserStoreRequest $request)
    {
        $companyId = $request->user()->company_id;
        $data = $request->validated();

        $role = Role::where('company_id', $companyId)->findOrFail($data['role_id']);

        $tempPassword = 'User@'.random_int(1000, 9999);

        $user = DB::transaction(function () use ($companyId, $data, $role, $tempPassword, $request) {
            $photo = null;
            if ($request->hasFile('photo_de_profil')) {
                $photo = $request->file('photo_de_profil')->store('users', 'public');
            }
            $user = User::create([
                'company_id' => $companyId,
                'code' => CodeGenerator::generate('users', $companyId, 'USR'),
                'username' => $data['username'],
                'email' => $data['email'],
                'password' => Hash::make($tempPassword),
                'is_active' => true,
                'must_change_password' => true,
                'photo_de_profil' => $photo,
            ]);
            DB::table('user_roles')->insert([
                'company_id' => $companyId,
                'code' => CodeGenerator::generate('user_roles', $companyId, 'UR'),
                'user_id' => $user->id,
                'role_id' => $role->id,
            ]);
            return $user->fresh();
        });

        // Envoyer un email d'accueil
        $company = \App\Models\Company::find($companyId);
        try { Mail::to($user->email)->send(new UserWelcome($company, $user->username, $user->email, $tempPassword)); } catch (\Throwable $e) {}
        return ApiResponse::success($user, 'auth.me_success', [], 201);
    }

    public function update(UserUpdateRequest $request, User $user)
    {
        $this->authorizeUser($user);
        $companyId = $request->user()->company_id;
        $data = $request->validated();

        DB::transaction(function () use ($user, $companyId, $data, $request) {
            $payload = [];
            foreach (['username','email','is_active'] as $f) {
                if (array_key_exists($f, $data)) { $payload[$f] = $data[$f]; }
            }
            // Photo upload/removal
            if ($request->boolean('remove_photo') === true && $user->photo_de_profil) {
                Storage::disk('public')->delete($user->photo_de_profil);
                $payload['photo_de_profil'] = null;
            }
            if ($request->hasFile('photo_de_profil')) {
                if ($user->photo_de_profil) {
                    Storage::disk('public')->delete($user->photo_de_profil);
                }
                $payload['photo_de_profil'] = $request->file('photo_de_profil')->store('users', 'public');
            }
            if ($payload) { $user->update($payload); }
            if (array_key_exists('role_id', $data)) {
                // remplacer l'unique role
                DB::table('user_roles')->where('company_id', $companyId)->where('user_id', $user->id)->delete();
                DB::table('user_roles')->insert([
                    'company_id' => $companyId,
                    'code' => CodeGenerator::generate('user_roles', $companyId, 'UR'),
                    'user_id' => $user->id,
                    'role_id' => $data['role_id'],
                ]);
            }
        });

        return ApiResponse::success($user->fresh(), 'auth.me_success');
    }

    public function destroy(User $user)
    {
        $this->authorizeUser($user);
        $user->delete();
        return ApiResponse::success(null, 'permissions.deleted');
    }

    public function trashed()
    {
        $companyId = request()->user()->company_id;
        $users = User::onlyTrashed()->where('company_id', $companyId)->get();
        return ApiResponse::success($users, 'permissions.trashed');
    }

    public function restore($id)
    {
        $companyId = request()->user()->company_id;
        $user = User::withTrashed()->where('company_id', $companyId)->findOrFail($id);
        $user->restore();
        return ApiResponse::success($user, 'permissions.restored');
    }

    public function forceDelete($id)
    {
        $companyId = request()->user()->company_id;
        $user = User::withTrashed()->where('company_id', $companyId)->findOrFail($id);
        $user->forceDelete();
        return ApiResponse::success(null, 'permissions.force_deleted');
    }

    private function authorizeUser(User $user): void
    {
        if ($user->company_id !== request()->user()->company_id) {
            abort(403);
        }
    }
}


