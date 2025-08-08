<?php

namespace App\Support;

use Illuminate\Contracts\Support\Arrayable;
use Illuminate\Http\JsonResponse;

class ApiResponse
{
    public static function success(
        array|Arrayable|null $data = null,
        ?string $message = null,
        array $meta = [],
        int $status = 200
    ): JsonResponse {
        $translatedMessage = null;
        if ($message !== null) {
            $key = str_starts_with($message, 'messages.') ? $message : ('messages.' . $message);
            $translatedMessage = __($key);
        }

        return response()->json([
            'success' => true,
            'message' => $translatedMessage,
            'data' => $data instanceof Arrayable ? $data->toArray() : $data,
            'meta' => $meta,
        ], $status);
    }

    public static function error(
        string $message,
        int $status = 400,
        ?string $errorCode = null,
        array $errors = [],
        array $meta = []
    ): JsonResponse {
        $key = str_starts_with($message, 'messages.') ? $message : ('messages.' . $message);
        $translatedMessage = __($key);

        return response()->json([
            'success' => false,
            'message' => $translatedMessage,
            'code' => $errorCode,
            'errors' => $errors,
            'meta' => $meta,
        ], $status);
    }
}


