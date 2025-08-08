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

        $token = $superAdmin->createToken('superadmin')->plainTextToken;

        return ApiResponse::success([
            'token' => $token,
            'superadmin' => [
                'id' => $superAdmin->id,
                'username' => $superAdmin->username,
                'email' => $superAdmin->email,
            ],
        ], 'auth.login_success');
    }

    public function me(Request $request)
    {
        return ApiResponse::success($request->user());
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return ApiResponse::success(null, 'auth.logout_success');
    }
}


