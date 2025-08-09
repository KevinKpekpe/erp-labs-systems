<?php

namespace App\Http\Controllers\Api\Admin;

use App\Exceptions\ApiException;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\LoginRequest;
use App\Models\Company;
use App\Models\User;
use App\Support\ApiResponse;
use Illuminate\Support\Facades\Hash;
use App\Http\Requests\Admin\ChangePasswordRequest;
use Illuminate\Support\Facades\DB;

class AuthController extends Controller
{
    public function login(LoginRequest $request)
    {
        $data = $request->validated();

        $company = Company::where('code', $data['company_code'])->first();
        if (!$company) {
            throw new ApiException('errors.not_found', 404, 'COMPANY_NOT_FOUND');
        }

        $user = User::where('company_id', $company->id)
            ->where(function ($q) use ($data) {
                $q->where('username', $data['login'])->orWhere('email', $data['login']);
            })->first();

        if (!$user || !Hash::check($data['password'], $user->password)) {
            throw new ApiException('auth.invalid_credentials', 401, 'INVALID_CREDENTIALS', [
                'login' => [__('messages.auth.invalid_credentials')],
            ]);
        }

        if (!$user->is_active) {
            throw new ApiException('auth.inactive_account', 403, 'INACTIVE_ACCOUNT');
        }

        $tokenResult = $user->createToken('admin');
        $token = $tokenResult->plainTextToken;

        return ApiResponse::success([
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'username' => $user->username,
                'email' => $user->email,
                'company_id' => $user->company_id,
                'must_change_password' => $user->must_change_password,
            ],
        ], 'auth.login_success');
    }

    public function changePassword(ChangePasswordRequest $request)
    {
        $user = $request->user();
        $data = $request->validated();
        if (!Hash::check($data['current_password'], $user->password)) {
            throw new ApiException('validation.failed', 422, 'INVALID_CURRENT_PASSWORD', [
                'current_password' => [__('validation.password')],
            ]);
        }
        $user->update(['password' => Hash::make($data['new_password']), 'must_change_password' => false]);
        // Optionnel: invalider les autres tokens
        $user->tokens()->where('id', '!=', $request->user()->currentAccessToken()->id)->delete();
        return ApiResponse::success(null, 'auth.password_changed');
    }

    public function me()
    {
        $user = request()->user();
        $company = Company::find($user->company_id);
        $roles = DB::table('user_roles')
            ->join('roles', 'user_roles.role_id', '=', 'roles.id')
            ->where('user_roles.user_id', $user->id)
            ->where('user_roles.company_id', $user->company_id)
            ->select('roles.id', 'roles.code', 'roles.nom_role')
            ->get();

        $permissions = DB::table('user_roles')
            ->join('role_permissions', function ($join) {
                $join->on('user_roles.role_id', '=', 'role_permissions.role_id')
                     ->on('user_roles.company_id', '=', 'role_permissions.company_id');
            })
            ->join('permissions', 'role_permissions.permission_id', '=', 'permissions.id')
            ->where('user_roles.user_id', $user->id)
            ->where('user_roles.company_id', $user->company_id)
            ->select('permissions.code', 'permissions.action', 'permissions.module')
            ->distinct()
            ->get();

        return ApiResponse::success([
            'user' => $user,
            'company' => $company,
            'roles' => $roles,
            'permissions' => $permissions,
        ], 'auth.me_success');
    }
}


