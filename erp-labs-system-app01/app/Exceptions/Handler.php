<?php

namespace App\Exceptions;

use App\Support\ApiResponse;
use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;
use Throwable;

class Handler extends ExceptionHandler
{
    public function register(): void
    {
        $this->renderable(function (ApiException $e) {
            return ApiResponse::error(
                $e->getMessage(),
                $e->status,
                $e->errorCode,
                $e->errors
            );
        });

        $this->renderable(function (ValidationException $e) {
            return ApiResponse::error(
                'validation.failed',
                422,
                'VALIDATION_ERROR',
                $e->errors()
            );
        });

        $this->renderable(function (Throwable $e) {
            if ($e instanceof HttpResponseException) {
                return $e->getResponse();
            }

            if ($e instanceof HttpExceptionInterface) {
                $message = $e->getMessage() ?: 'errors.http';
                return ApiResponse::error($message, $e->getStatusCode());
            }

            if (app()->hasDebugModeEnabled()) {
                return null; // laisser Laravel afficher la stack en debug
            }

            return ApiResponse::error('errors.unexpected', 500, 'UNEXPECTED_ERROR');
        });
    }
}


