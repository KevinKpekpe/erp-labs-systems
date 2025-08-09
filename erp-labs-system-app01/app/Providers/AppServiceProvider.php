<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Route;
use App\Http\Middleware\SetLocale;
use App\Http\Middleware\ForceJsonForApi;
use App\Http\Middleware\EnsureSuperAdmin;
use App\Http\Middleware\AuthorizePermission;
use App\Http\Middleware\EnsurePasswordChanged;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Enregistrer le middleware de locale globalement
        Route::pushMiddlewareToGroup('web', SetLocale::class);
        Route::pushMiddlewareToGroup('api', SetLocale::class);
        Route::pushMiddlewareToGroup('api', ForceJsonForApi::class);
        Route::aliasMiddleware('superadmin', EnsureSuperAdmin::class);
        Route::aliasMiddleware('can.permission', AuthorizePermission::class);
        Route::aliasMiddleware('must.change.password', EnsurePasswordChanged::class);
    }
}
