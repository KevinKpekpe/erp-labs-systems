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
use App\Http\Requests\Admin\ForgotPasswordRequest;
use App\Http\Requests\Admin\ResetPasswordRequest;
use Illuminate\Support\Facades\Mail;
use App\Mail\UserPasswordReset;
use App\Http\Requests\Admin\UpdateProfileRequest;
use Illuminate\Support\Facades\Storage;
use App\Services\AuditService;

class AuthController extends Controller
{
    public function login(LoginRequest $request)
    {
        $data = $request->validated();

        $company = Company::where('code', $data['company_code'])->first();
        if (!$company) {
            throw new ApiException('errors.not_found', 404, 'COMPANY_NOT_FOUND');
        }
        if ($company->deleted_at) {
            throw new ApiException('errors.forbidden', 403, 'COMPANY_DELETED');
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

        // Mettre à jour la dernière connexion
        $user->update(['last_login' => now()]);

        $tokenResult = $user->createToken('admin');
        $token = $tokenResult->plainTextToken;

        AuditService::log('LOGIN', 'users', $user->id, 'User login');

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
        AuditService::log('CHANGE_PASSWORD', 'users', $user->id, 'User changed password');
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

    public function forgotPassword(ForgotPasswordRequest $request)
    {
        $data = $request->validated();
        $company = Company::where('code', $data['company_code'])->first();
        if (!$company) {
            return ApiResponse::success(null, 'auth.otp_sent');
        }
        $user = User::where('company_id', $company->id)->where('email', $data['email'])->first();
        if (!$user) {
            return ApiResponse::success(null, 'auth.otp_sent');
        }
        $otp = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $data['email']],
            ['token' => $otp, 'created_at' => now()]
        );
        Mail::to($data['email'])->send(new UserPasswordReset($otp));
        return ApiResponse::success(null, 'auth.otp_sent');
    }

    public function resetPassword(ResetPasswordRequest $request)
    {
        $data = $request->validated();
        $company = Company::where('code', $data['company_code'])->first();
        if (!$company) {
            throw new ApiException('errors.not_found', 404, 'COMPANY_NOT_FOUND');
        }
        $row = DB::table('password_reset_tokens')->where('email', $data['email'])->first();
        if (!$row || !hash_equals($row->token, $data['otp'])) {
            throw new ApiException('auth.token_invalid', 401, 'TOKEN_INVALID');
        }
        if (now()->diffInMinutes($row->created_at) > 15) {
            throw new ApiException('auth.token_expired', 401, 'TOKEN_EXPIRED');
        }
        $user = User::where('company_id', $company->id)->where('email', $data['email'])->first();
        if (!$user) {
            throw new ApiException('errors.not_found', 404, 'USER_NOT_FOUND');
        }
        $user->update(['password' => Hash::make($data['new_password']), 'must_change_password' => false]);
        DB::table('password_reset_tokens')->where('email', $data['email'])->delete();
        // Invalider les tokens actifs
        $user->tokens()->delete();
        return ApiResponse::success(null, 'auth.password_reset_success');
    }

    public function updateProfile(UpdateProfileRequest $request)
    {
        $user = $request->user();
        $data = $request->validated();
        $payload = [];
        foreach (['username','email','telephone','sexe'] as $f) {
            if ($request->has($f)) { $payload[$f] = $request->input($f); }
        }
        if (($data['remove_photo'] ?? false) === true) {
            if ($user->photo_de_profil && Storage::disk('public')->exists($user->photo_de_profil)) {
                Storage::disk('public')->delete($user->photo_de_profil);
            }
            $payload['photo_de_profil'] = null;
        } elseif ($request->hasFile('photo_de_profil')) {
            $path = $request->file('photo_de_profil')->store('users', 'public');
            if ($user->photo_de_profil && Storage::disk('public')->exists($user->photo_de_profil)) {
                Storage::disk('public')->delete($user->photo_de_profil);
            }
            $payload['photo_de_profil'] = $path;
        }
        $user->fill($payload)->save();
        $fresh = $user->fresh();
        AuditService::log('UPDATE_PROFILE', 'users', $fresh->id, 'User updated profile');
        return ApiResponse::success($fresh, 'auth.profile_updated');
    }
}


