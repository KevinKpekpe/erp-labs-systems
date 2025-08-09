<?php

namespace App\Http\Middleware;

use App\Exceptions\ApiException;
use App\Models\Permission;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AuthorizePermission
{
    /**
     * Vérifie que l'utilisateur a une permission (action, module) dans sa compagnie
     * Usage: middleware('can.permission:CREATE,PATIENT')
     */
    public function handle(Request $request, Closure $next, string $action, string $module)
    {
        $user = $request->user();
        if (!$user) {
            throw new ApiException('errors.unauthorized', 401, 'UNAUTHENTICATED');
        }

        $permissionId = Permission::where('action', $action)->where('module', $module)->value('id');
        if (!$permissionId) {
            throw new ApiException('errors.forbidden', 403, 'PERMISSION_NOT_DEFINED');
        }

        $has = DB::table('user_roles')
            ->join('role_permissions', function ($join) {
                $join->on('user_roles.role_id', '=', 'role_permissions.role_id')
                     ->on('user_roles.company_id', '=', 'role_permissions.company_id');
            })
            ->where('user_roles.user_id', $user->id)
            ->where('user_roles.company_id', $user->company_id)
            ->where('role_permissions.permission_id', $permissionId)
            ->exists();

        if (!$has) {
            throw new ApiException('errors.forbidden', 403, 'FORBIDDEN');
        }

        return $next($request);
    }
}


