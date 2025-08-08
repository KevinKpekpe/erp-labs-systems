<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use App\Support\ApiResponse;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        //
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->reportable(function (Throwable $e) {
            // Hook global si besoin
        });

        // API exceptions rendering (Laravel 11+/12 style)
        $exceptions->render(function (App\Exceptions\ApiException $e, $request) {
            return ApiResponse::error($e->getMessage(), $e->status, $e->errorCode, $e->errors);
        });

        $exceptions->render(function (Illuminate\Validation\ValidationException $e, $request) {
            return ApiResponse::error('validation.failed', 422, 'VALIDATION_ERROR', $e->errors());
        });

        $exceptions->render(function (Symfony\Component\HttpKernel\Exception\HttpExceptionInterface $e, $request) {
            $message = $e->getMessage() ?: 'errors.http';
            return ApiResponse::error($message, $e->getStatusCode());
        });

        $exceptions->render(function (Throwable $e, $request) {
            if (config('app.debug')) {
                return null; // laisser le handler par défaut en mode debug
            }
            return ApiResponse::error('errors.unexpected', 500, 'UNEXPECTED_ERROR');
        });
    })->create();
