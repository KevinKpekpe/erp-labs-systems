<?php

namespace App\Http\Middleware;

use App\Exceptions\ApiException;
use App\Models\SuperAdmin;
use Closure;
use Illuminate\Http\Request;

class EnsureSuperAdmin
{
    public function handle(Request $request, Closure $next)
    {
        $user = $request->user();
        if (!$user instanceof SuperAdmin) {
            throw new ApiException('errors.forbidden', 403, 'FORBIDDEN');
        }
        return $next($request);
    }
}


