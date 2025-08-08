<?php

namespace App\Http\Controllers\Api\SuperAdmin;

use App\Exceptions\ApiException;
use App\Http\Controllers\Controller;
use App\Models\SuperAdmin;
use App\Http\Requests\SuperAdmin\LoginRequest;
use App\Support\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function login(LoginRequest $request)
    {
        $credentials = $request->validated();

        $superAdmin = SuperAdmin::query()
            ->where('username', $credentials['login'])
            ->orWhere('email', $credentials['login'])
            ->first();

        if (!$superAdmin || !Hash::check($credentials['password'], $superAdmin->password)) {
            throw new ApiException(
                'auth.invalid_credentials',
                401,
                'INVALID_CREDENTIALS',
                [
                    'login' => [__('messages.auth.invalid_credentials')],
                ]
            );
        }

        if (!$superAdmin->is_active) {
            throw new ApiException(
                'auth.inactive_account',
                403,
                'INACTIVE_ACCOUNT',
                [
                    'login' => [__('messages.auth.inactive_account')],
                ]
            );
        }

        // Mettre à jour la dernière connexion
        $superAdmin->update(['last_login' => now()]);

        $tokenResult = $superAdmin->createToken('superadmin');
        $tokenModel = $tokenResult->accessToken ?? $tokenResult->token ?? null; // compatibilité
        $ttl = (int) config('auth_tokens.ttl_minutes', 0);
        if ($ttl > 0 && $tokenModel && method_exists($tokenModel, 'forceFill')) {
            $tokenModel->forceFill(['expires_at' => now()->addMinutes($ttl)])->save();
        }
        $token = $tokenResult->plainTextToken;

        return ApiResponse::success([
            'token' => $token,
            'superadmin' => [
                'id' => $superAdmin->id,
                'username' => $superAdmin->username,
                'email' => $superAdmin->email,
            ],
            'expires_at' => ($ttl > 0 && $tokenModel) ? $tokenModel->expires_at : null,
        ], 'auth.login_success');
    }

    public function me(Request $request)
    {
        // Restreindre à SuperAdmin pour éviter collision avec users
        $user = $request->user();
        if (!$user instanceof \App\Models\SuperAdmin) {
            throw new \App\Exceptions\ApiException('errors.unauthorized', 401, 'UNAUTHENTICATED');
        }
        return ApiResponse::success($user, 'auth.me_success');
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return ApiResponse::success(null, 'auth.logout_success');
    }
}


