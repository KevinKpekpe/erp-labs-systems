<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\SuperAdmin\AuthController as SuperAdminAuthController;
use App\Http\Controllers\Api\SuperAdmin\ProfileController as SuperAdminProfileController;
use App\Http\Controllers\Api\SuperAdmin\PermissionController as SuperAdminPermissionController;
use App\Http\Controllers\Api\SuperAdmin\CompanyController as SuperAdminCompanyController;
use App\Http\Controllers\Api\Admin\AuthController as AdminAuthController;

// SuperAdmin Auth
Route::prefix('v1/superadmin')->group(function () {
    Route::post('/login', [SuperAdminAuthController::class, 'login']);

    Route::middleware(['auth:sanctum','superadmin'])->group(function () {
        Route::get('/me', [SuperAdminAuthController::class, 'me']);
        Route::post('/logout', [SuperAdminAuthController::class, 'logout']);

        // Profil superadmin (unique endpoint)
        Route::post('/profile', [SuperAdminProfileController::class, 'update']);
        Route::post('/change-password', [SuperAdminProfileController::class, 'changePassword']);

        // Permissions CRUD (superadmin)
        Route::get('/permissions', [SuperAdminPermissionController::class, 'index']);
        Route::post('/permissions', [SuperAdminPermissionController::class, 'store']);
        Route::get('/permissions/{permission}', [SuperAdminPermissionController::class, 'show']);
        Route::put('/permissions/{permission}', [SuperAdminPermissionController::class, 'update']);
        Route::delete('/permissions/{permission}', [SuperAdminPermissionController::class, 'destroy']);
        Route::get('/permissions-trashed', [SuperAdminPermissionController::class, 'trashed']);
        Route::post('/permissions/{id}/restore', [SuperAdminPermissionController::class, 'restore']);
        Route::delete('/permissions/{id}/force', [SuperAdminPermissionController::class, 'forceDelete']);

        // Companies
        Route::get('/companies', [SuperAdminCompanyController::class, 'index']);
        Route::post('/companies', [SuperAdminCompanyController::class, 'store']);
        Route::post('/companies/{company}', [SuperAdminCompanyController::class, 'update']);
        Route::delete('/companies/{company}', [SuperAdminCompanyController::class, 'destroy']);
        Route::get('/companies-trashed', [SuperAdminCompanyController::class, 'trashed']);
        Route::post('/companies/{id}/restore', [SuperAdminCompanyController::class, 'restore']);
        Route::delete('/companies/{id}/force', [SuperAdminCompanyController::class, 'forceDelete']);
    });

    // Mot de passe oublié / reset
    Route::post('/forgot-password', [SuperAdminProfileController::class, 'forgotPassword']);
    Route::post('/reset-password', [SuperAdminProfileController::class, 'resetPassword']);
    Route::post('/resend-otp', [SuperAdminProfileController::class, 'resendOtp']);
});

// Users (Company admins/employés) Auth
Route::prefix('v1')->group(function () {
    Route::post('/auth/login', [AdminAuthController::class, 'login']);
    Route::middleware(['auth:sanctum','must.change.password'])->group(function () {
        Route::post('/auth/change-password', [AdminAuthController::class, 'changePassword']);
        Route::get('/auth/me', [AdminAuthController::class, 'me']);
    });
});
