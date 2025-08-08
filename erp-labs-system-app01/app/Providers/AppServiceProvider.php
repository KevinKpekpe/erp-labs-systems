<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Route;
use App\Http\Middleware\SetLocale;
use App\Http\Middleware\ForceJsonForApi;

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
    }
}
