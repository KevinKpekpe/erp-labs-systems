<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\SuperAdmin\AuthController as SuperAdminAuthController;
use App\Http\Controllers\Api\SuperAdmin\ProfileController as SuperAdminProfileController;
use App\Http\Controllers\Api\SuperAdmin\PermissionController as SuperAdminPermissionController;
use App\Http\Controllers\Api\SuperAdmin\CompanyController as SuperAdminCompanyController;
use App\Http\Controllers\Api\Admin\AuthController as AdminAuthController;
use App\Http\Controllers\Api\Compagnies\CompanyController as UserCompanyController;
use App\Http\Controllers\Api\Compagnies\RoleController as CompanyRoleController;
use App\Http\Controllers\Api\Compagnies\UserController as CompanyUserController;
use App\Http\Controllers\Api\Compagnies\Stock\CategoryController as StockCategoryController;
use App\Http\Controllers\Api\Compagnies\Stock\ArticleController as StockArticleController;
use App\Http\Controllers\Api\Compagnies\Stock\StockController as StockStockController;
use App\Http\Controllers\Api\Compagnies\Stock\MovementController as StockMovementController;
use App\Http\Controllers\Api\Compagnies\Patients\PatientTypeController;
use App\Http\Controllers\Api\Compagnies\Patients\DoctorController;
use App\Http\Controllers\Api\Compagnies\Patients\PatientController;
use App\Http\Controllers\Api\Compagnies\Exams\ExamController;
use App\Http\Controllers\Api\Compagnies\Exams\ExamRequestController;

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

//Auth
Route::prefix('v1')->group(function () {
    Route::post('/auth/login', [AdminAuthController::class, 'login']);
    // Public password reset
    Route::post('/auth/forgot-password', [AdminAuthController::class, 'forgotPassword']);
    Route::post('/auth/reset-password', [AdminAuthController::class, 'resetPassword']);
    Route::post('/auth/resend-otp', [AdminAuthController::class, 'resendOtp']);
    Route::middleware(['auth:sanctum','must.change.password'])->group(function () {
        Route::post('/auth/change-password', [AdminAuthController::class, 'changePassword']);
        Route::post('/auth/logout', [AdminAuthController::class, 'logout']);
        Route::get('/auth/me', [AdminAuthController::class, 'me']);
        Route::post('/auth/profile', [AdminAuthController::class, 'updateProfile']);
        Route::post('/company', [UserCompanyController::class, 'updateMyCompany'])
            ->middleware('can.permission:UPDATE,COMPANY');

        // Company Roles (permissions attached)
        Route::get('/roles', [CompanyRoleController::class, 'index'])->middleware('can.permission:LIST,ROLE');
        Route::get('/roles/{role}', [CompanyRoleController::class, 'show'])->middleware('can.permission:LIST,ROLE');
        Route::post('/roles', [CompanyRoleController::class, 'store'])->middleware('can.permission:CREATE,ROLE');
        Route::put('/roles/{role}', [CompanyRoleController::class, 'update'])->middleware('can.permission:UPDATE,ROLE');
        Route::delete('/roles/{role}', [CompanyRoleController::class, 'destroy'])->middleware('can.permission:DELETE,ROLE');
        Route::get('/roles-trashed', [CompanyRoleController::class, 'trashed'])->middleware('can.permission:LIST,ROLE');
        Route::post('/roles/{id}/restore', [CompanyRoleController::class, 'restore'])->middleware('can.permission:UPDATE,ROLE');
        Route::delete('/roles/{id}/force', [CompanyRoleController::class, 'forceDelete'])->middleware('can.permission:DELETE,ROLE');

        // Company Users (1 role only)
        Route::get('/users', [CompanyUserController::class, 'index'])->middleware('can.permission:LIST,USER');
        Route::post('/users', [CompanyUserController::class, 'store'])->middleware('can.permission:CREATE,USER');
        Route::post('/users/{user}', [CompanyUserController::class, 'update'])->middleware('can.permission:UPDATE,USER');
        Route::delete('/users/{user}', [CompanyUserController::class, 'destroy'])->middleware('can.permission:DELETE,USER');
        Route::get('/users-trashed', [CompanyUserController::class, 'trashed'])->middleware('can.permission:LIST,USER');
        Route::post('/users/{id}/restore', [CompanyUserController::class, 'restore'])->middleware('can.permission:UPDATE,USER');
        Route::delete('/users/{id}/force', [CompanyUserController::class, 'forceDelete'])->middleware('can.permission:DELETE,USER');

        // Stock - Categories
        Route::get('/stock/categories', [StockCategoryController::class, 'index'])->middleware('can.permission:LIST,STOCK');
        Route::post('/stock/categories', [StockCategoryController::class, 'store'])->middleware('can.permission:CREATE,STOCK');
        Route::get('/stock/categories/{category}', [StockCategoryController::class, 'show'])->middleware('can.permission:LIST,STOCK');
        Route::put('/stock/categories/{category}', [StockCategoryController::class, 'update'])->middleware('can.permission:UPDATE,STOCK');
        Route::delete('/stock/categories/{category}', [StockCategoryController::class, 'destroy'])->middleware('can.permission:DELETE,STOCK');
        Route::get('/stock/categories-trashed', [StockCategoryController::class, 'trashed'])->middleware('can.permission:LIST,STOCK');
        Route::post('/stock/categories/{id}/restore', [StockCategoryController::class, 'restore'])->middleware('can.permission:UPDATE,STOCK');
        Route::delete('/stock/categories/{id}/force', [StockCategoryController::class, 'forceDelete'])->middleware('can.permission:DELETE,STOCK');

        // Stock - Articles
        Route::get('/stock/articles', [StockArticleController::class, 'index'])->middleware('can.permission:LIST,STOCK');
        Route::post('/stock/articles', [StockArticleController::class, 'store'])->middleware('can.permission:CREATE,STOCK');
        Route::get('/stock/articles/{article}', [StockArticleController::class, 'show'])->middleware('can.permission:LIST,STOCK');
        Route::put('/stock/articles/{article}', [StockArticleController::class, 'update'])->middleware('can.permission:UPDATE,STOCK');
        Route::delete('/stock/articles/{article}', [StockArticleController::class, 'destroy'])->middleware('can.permission:DELETE,STOCK');
        Route::get('/stock/articles-trashed', [StockArticleController::class, 'trashed'])->middleware('can.permission:LIST,STOCK');
        Route::post('/stock/articles/{id}/restore', [StockArticleController::class, 'restore'])->middleware('can.permission:UPDATE,STOCK');
        Route::delete('/stock/articles/{id}/force', [StockArticleController::class, 'forceDelete'])->middleware('can.permission:DELETE,STOCK');

        // Stock - Stocks
        Route::get('/stock/stocks', [StockStockController::class, 'index'])->middleware('can.permission:LIST,STOCK');
        Route::post('/stock/stocks', [StockStockController::class, 'store'])->middleware('can.permission:CREATE,STOCK');
        Route::get('/stock/stocks/{stock}', [StockStockController::class, 'show'])->middleware('can.permission:LIST,STOCK');
        Route::put('/stock/stocks/{stock}', [StockStockController::class, 'update'])->middleware('can.permission:UPDATE,STOCK');
        Route::delete('/stock/stocks/{stock}', [StockStockController::class, 'destroy'])->middleware('can.permission:DELETE,STOCK');
        Route::get('/stock/stocks-trashed', [StockStockController::class, 'trashed'])->middleware('can.permission:LIST,STOCK');
        Route::post('/stock/stocks/{id}/restore', [StockStockController::class, 'restore'])->middleware('can.permission:UPDATE,STOCK');
        Route::delete('/stock/stocks/{id}/force', [StockStockController::class, 'forceDelete'])->middleware('can.permission:DELETE,STOCK');

        // Stock - Movements
        Route::get('/stock/movements', [StockMovementController::class, 'index'])->middleware('can.permission:LIST,STOCK');
        Route::post('/stock/movements', [StockMovementController::class, 'store'])->middleware('can.permission:CREATE,STOCK');

        // Patients - Types
        Route::get('/patients/types', [PatientTypeController::class, 'index'])->middleware('can.permission:LIST,PATIENT');
        Route::post('/patients/types', [PatientTypeController::class, 'store'])->middleware('can.permission:CREATE,PATIENT');
        Route::get('/patients/types/{type}', [PatientTypeController::class, 'show'])->middleware('can.permission:LIST,PATIENT');
        Route::put('/patients/types/{type}', [PatientTypeController::class, 'update'])->middleware('can.permission:UPDATE,PATIENT');
        Route::delete('/patients/types/{type}', [PatientTypeController::class, 'destroy'])->middleware('can.permission:DELETE,PATIENT');
        Route::get('/patients/types-trashed', [PatientTypeController::class, 'trashed'])->middleware('can.permission:LIST,PATIENT');
        Route::post('/patients/types/{id}/restore', [PatientTypeController::class, 'restore'])->middleware('can.permission:UPDATE,PATIENT');
        Route::delete('/patients/types/{id}/force', [PatientTypeController::class, 'forceDelete'])->middleware('can.permission:DELETE,PATIENT');

        // Doctors
        Route::get('/doctors', [DoctorController::class, 'index'])->middleware('can.permission:LIST,DOCTOR');
        Route::post('/doctors', [DoctorController::class, 'store'])->middleware('can.permission:CREATE,DOCTOR');
        Route::get('/doctors/{doctor}', [DoctorController::class, 'show'])->middleware('can.permission:LIST,DOCTOR');
        Route::put('/doctors/{doctor}', [DoctorController::class, 'update'])->middleware('can.permission:UPDATE,DOCTOR');
        Route::delete('/doctors/{doctor}', [DoctorController::class, 'destroy'])->middleware('can.permission:DELETE,DOCTOR');
        Route::get('/doctors-trashed', [DoctorController::class, 'trashed'])->middleware('can.permission:LIST,DOCTOR');
        Route::post('/doctors/{id}/restore', [DoctorController::class, 'restore'])->middleware('can.permission:UPDATE,DOCTOR');
        Route::delete('/doctors/{id}/force', [DoctorController::class, 'forceDelete'])->middleware('can.permission:DELETE,DOCTOR');

        // Patients
        Route::get('/patients', [PatientController::class, 'index'])->middleware('can.permission:LIST,PATIENT');
        Route::post('/patients', [PatientController::class, 'store'])->middleware('can.permission:CREATE,PATIENT');
        Route::get('/patients/{patient}', [PatientController::class, 'show'])->middleware('can.permission:LIST,PATIENT');
        Route::put('/patients/{patient}', [PatientController::class, 'update'])->middleware('can.permission:UPDATE,PATIENT');
        Route::delete('/patients/{patient}', [PatientController::class, 'destroy'])->middleware('can.permission:DELETE,PATIENT');
        Route::get('/patients-trashed', [PatientController::class, 'trashed'])->middleware('can.permission:LIST,PATIENT');
        Route::post('/patients/{id}/restore', [PatientController::class, 'restore'])->middleware('can.permission:UPDATE,PATIENT');
        Route::delete('/patients/{id}/force', [PatientController::class, 'forceDelete'])->middleware('can.permission:DELETE,PATIENT');

        // Exams
        Route::get('/exams', [ExamController::class, 'index'])->middleware('can.permission:LIST,EXAMEN');
        Route::post('/exams', [ExamController::class, 'store'])->middleware('can.permission:CREATE,EXAMEN');
        Route::get('/exams/{exam}', [ExamController::class, 'show'])->middleware('can.permission:LIST,EXAMEN');
        Route::put('/exams/{exam}', [ExamController::class, 'update'])->middleware('can.permission:UPDATE,EXAMEN');
        Route::delete('/exams/{exam}', [ExamController::class, 'destroy'])->middleware('can.permission:DELETE,EXAMEN');
        Route::get('/exams-trashed', [ExamController::class, 'trashed'])->middleware('can.permission:LIST,EXAMEN');
        Route::post('/exams/{id}/restore', [ExamController::class, 'restore'])->middleware('can.permission:UPDATE,EXAMEN');
        Route::delete('/exams/{id}/force', [ExamController::class, 'forceDelete'])->middleware('can.permission:DELETE,EXAMEN');

        // Exam Requests
        Route::get('/exam-requests', [ExamRequestController::class, 'index'])->middleware('can.permission:LIST,DEMANDE');
        Route::post('/exam-requests', [ExamRequestController::class, 'store'])->middleware('can.permission:CREATE,DEMANDE');
        Route::get('/exam-requests/{examRequest}', [ExamRequestController::class, 'show'])->middleware('can.permission:LIST,DEMANDE');
        Route::put('/exam-requests/{examRequest}', [ExamRequestController::class, 'update'])->middleware('can.permission:UPDATE,DEMANDE');
        Route::delete('/exam-requests/{examRequest}', [ExamRequestController::class, 'destroy'])->middleware('can.permission:DELETE,DEMANDE');
    });
});
