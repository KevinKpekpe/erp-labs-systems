<?php

namespace App\Http\Middleware;

use App\Exceptions\ApiException;
use Closure;
use Illuminate\Http\Request;

class EnsurePasswordChanged
{
    public function handle(Request $request, Closure $next)
    {
        $user = $request->user();

        // Autoriser le changement de mot de passe et la déconnexion même si le mot de passe n'est pas changé
        $path = $request->path();
        $isAllowed = str_contains($path, 'v1/auth/change-password') || str_contains($path, 'v1/auth/logout');

        if ($user && $user->must_change_password && !$isAllowed) {
            throw new ApiException('errors.forbidden', 403, 'MUST_CHANGE_PASSWORD');
        }

        return $next($request);
    }
}


