<?php

namespace App\Http\Controllers\Api\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\Permission;
use App\Support\ApiResponse;
use Illuminate\Http\Request;
use App\Http\Requests\SuperAdmin\PermissionStoreRequest;
use App\Http\Requests\SuperAdmin\PermissionUpdateRequest;

class PermissionController extends Controller
{
    public function index()
    {
        $permissions = Permission::orderBy('module')->orderBy('action')->get();
        return ApiResponse::success($permissions, 'auth.me_success');
    }

    public function store(PermissionStoreRequest $request)
    {
        $permission = Permission::create($request->validated());
        return ApiResponse::success($permission, 'permissions.created', [], 201);
    }

    public function show(Permission $permission)
    {
        return ApiResponse::success($permission);
    }

    public function update(PermissionUpdateRequest $request, Permission $permission)
    {
        $permission->update($request->validated());
        return ApiResponse::success($permission, 'permissions.updated');
    }

    public function destroy(Permission $permission)
    {
        $permission->delete();
        return ApiResponse::success(null, 'permissions.deleted');
    }

    public function trashed()
    {
        $permissions = Permission::onlyTrashed()->orderBy('module')->orderBy('action')->get();
        return ApiResponse::success($permissions, 'permissions.trashed');
    }

    public function restore($id)
    {
        $permission = Permission::withTrashed()->findOrFail($id);
        $permission->restore();
        return ApiResponse::success($permission, 'permissions.restored');
    }

    public function forceDelete($id)
    {
        $permission = Permission::withTrashed()->findOrFail($id);
        $permission->forceDelete();
        return ApiResponse::success(null, 'permissions.force_deleted');
    }
}


