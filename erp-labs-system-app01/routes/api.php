<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\SuperAdmin\AuthController as SuperAdminAuthController;
use App\Http\Controllers\Api\SuperAdmin\ProfileController as SuperAdminProfileController;

// SuperAdmin Auth
Route::prefix('v1/superadmin')->group(function () {
    Route::post('/login', [SuperAdminAuthController::class, 'login']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/me', [SuperAdminAuthController::class, 'me']);
        Route::post('/logout', [SuperAdminAuthController::class, 'logout']);

        // Profil superadmin (unique endpoint)
        Route::post('/profile', [SuperAdminProfileController::class, 'update']);
        Route::post('/change-password', [SuperAdminProfileController::class, 'changePassword']);
    });

    // Mot de passe oublié / reset
    Route::post('/forgot-password', [SuperAdminProfileController::class, 'forgotPassword']);
    Route::post('/reset-password', [SuperAdminProfileController::class, 'resetPassword']);
    Route::post('/resend-otp', [SuperAdminProfileController::class, 'resendOtp']);
});
