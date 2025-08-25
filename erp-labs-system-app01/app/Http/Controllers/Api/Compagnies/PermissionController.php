<?php

namespace App\Http\Controllers\Api\Compagnies;

use App\Http\Controllers\Controller;
use App\Models\Permission;
use App\Support\ApiResponse;

class PermissionController extends Controller
{
    public function index()
    {
        // Liste simple des permissions disponibles pour associer aux rôles
        $q = request('q') ?? request('search');
        $query = Permission::query();
        if (!empty($q)) {
            $query->where(function ($qr) use ($q) {
                $qr->where('code', 'LIKE', "%$q%")
                    ->orWhere('module', 'LIKE', "%$q%")
                    ->orWhere('action', 'LIKE', "%$q%")
                ;
            });
        }
        $perPage = (int) (request('per_page') ?? 200);
        $perms = $query->orderBy('module')->orderBy('action')->paginate($perPage);
        return ApiResponse::success($perms, 'permissions.list');
    }
}
