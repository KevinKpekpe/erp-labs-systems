<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use App\Support\ApiResponse;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;
use Illuminate\Routing\Exceptions\RouteNotFoundException as IlluminateRouteNotFoundException;
use Symfony\Component\Routing\Exception\RouteNotFoundException as SymfonyRouteNotFoundException;
use Laravel\Sanctum\PersonalAccessToken;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // Audit toutes les requêtes API
        $middleware->append(App\Http\Middleware\AuditRequest::class);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->reportable(function (Throwable $e) {
            // Hook global si besoin
        });

        // API exceptions rendering (Laravel 11+/12 style)
        $exceptions->render(function (App\Exceptions\ApiException $e, $request) {
            return ApiResponse::error($e->getMessage(), $e->status, $e->errorCode, $e->errors);
        });

        $exceptions->render(function (ValidationException $e, $request) {
            return ApiResponse::error('validation.failed', 422, 'VALIDATION_ERROR', $e->errors());
        });

        $exceptions->render(function (HttpExceptionInterface $e, $request) {
            $message = $e->getMessage() ?: 'errors.http';
            return ApiResponse::error($message, $e->getStatusCode());
        });

        $exceptions->render(function (AuthenticationException $e, $request) {
            $bearer = $request->bearerToken();
            if (!$bearer) {
                return ApiResponse::error('errors.unauthorized', 401, 'TOKEN_MISSING');
            }
            try {
                $hash = hash('sha256', $bearer);
                $token = PersonalAccessToken::query()->where('token', $hash)->first();
                if (!$token) {
                    return ApiResponse::error('auth.token_invalid', 401, 'TOKEN_INVALID');
                }
                if (!is_null($token->expires_at) && $token->expires_at < now()) {
                    return ApiResponse::error('auth.token_expired', 401, 'TOKEN_EXPIRED');
                }
            } catch (Throwable $t) {
                // En cas d'erreur lors de la vérification, renvoyer non autorisé générique
                return ApiResponse::error('errors.unauthorized', 401, 'UNAUTHENTICATED');
            }
            return ApiResponse::error('errors.unauthorized', 401, 'UNAUTHENTICATED');
        });

        // Eviter toute page HTML quand la route 'login' n'existe pas (redirection implicite)
        $exceptions->render(function (IlluminateRouteNotFoundException $e, $request) {
            // Typiquement: "Route [login] not defined." quand une redirection d'auth échoue
            return ApiResponse::error('errors.unauthorized', 401, 'UNAUTHENTICATED');
        });

        $exceptions->render(function (SymfonyRouteNotFoundException $e, $request) {
            return ApiResponse::error('errors.unauthorized', 401, 'UNAUTHENTICATED');
        });

        $exceptions->render(function (Throwable $e, $request) {
            // Pour les routes API, ne jamais renvoyer de HTML, même en debug
            if ($request->is('api/*')) {
                return ApiResponse::error('errors.unexpected', 500, 'UNEXPECTED_ERROR');
            }
            if (config('app.debug')) {
                return null; // en web, laisser la page debug
            }
            return ApiResponse::error('errors.unexpected', 500, 'UNEXPECTED_ERROR');
        });
    })->create();
