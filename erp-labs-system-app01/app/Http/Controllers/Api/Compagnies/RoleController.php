<?php

namespace App\Http\Controllers\Api\Compagnies;

use App\Http\Controllers\Controller;
use App\Http\Requests\Compagnies\RoleStoreRequest;
use App\Http\Requests\Compagnies\RoleUpdateRequest;
use App\Models\Permission;
use App\Models\Role;
use App\Support\ApiResponse;
use App\Support\CodeGenerator;
use Illuminate\Support\Facades\DB;

class RoleController extends Controller
{
    public function index()
    {
        $companyId = request()->user()->company_id;
        $q = request('q') ?? request('search');
        $roles = Role::where('company_id', $companyId)
            ->search($q)
            ->with(['permissions' => function ($q) {
                $q->select('permissions.id', 'permissions.code', 'permissions.action', 'permissions.module');
            }])
            ->orderBy('nom_role')
            ->get();
        return ApiResponse::success($roles);
    }

    public function show(Role $role)
    {
        $this->authorizeRole($role);
        $role->load(['permissions' => function ($q) {
            $q->select('permissions.id', 'permissions.code', 'permissions.action', 'permissions.module');
        }]);
        return ApiResponse::success($role, 'permissions.details');
    }

    public function store(RoleStoreRequest $request)
    {
        $companyId = $request->user()->company_id;
        $data = $request->validated();

        $role = DB::transaction(function () use ($companyId, $data) {
            $role = Role::create([
                'company_id' => $companyId,
                'code' => CodeGenerator::generate('roles', $companyId, 'ROLE'),
                'nom_role' => $data['nom_role'],
            ]);

            if (!empty($data['permissions'])) {
                $permissionIds = array_values(array_unique(array_map('intval', $data['permissions'])));
                $pivot = [];
                foreach ($permissionIds as $pid) {
                    $pivot[] = [
                        'company_id' => $companyId,
                        'code' => CodeGenerator::generate('role_permissions', $companyId, 'RP'),
                        'role_id' => $role->id,
                        'permission_id' => $pid,
                    ];
                }
                if ($pivot) {
                    DB::table('role_permissions')->insert($pivot);
                }
            }

            return $role->fresh();
        });

        return ApiResponse::success($role, 'permissions.created', [], 201);
    }

    public function update(RoleUpdateRequest $request, Role $role)
    {
        $this->authorizeRole($role);
        $companyId = $request->user()->company_id;
        $data = $request->validated();

        DB::transaction(function () use ($role, $companyId, $data) {
            if (isset($data['nom_role'])) {
                $role->update(['nom_role' => $data['nom_role']]);
            }
            if (array_key_exists('permissions', $data)) {
                DB::table('role_permissions')->where('company_id', $companyId)->where('role_id', $role->id)->delete();
                if (!empty($data['permissions'])) {
                    $permissionIds = array_values(array_unique(array_map('intval', $data['permissions'])));
                    $pivot = [];
                    foreach ($permissionIds as $pid) {
                        $pivot[] = [
                            'company_id' => $companyId,
                            'code' => CodeGenerator::generate('role_permissions', $companyId, 'RP'),
                            'role_id' => $role->id,
                            'permission_id' => $pid,
                        ];
                    }
                    if ($pivot) {
                        DB::table('role_permissions')->insert($pivot);
                    }
                }
            }
        });

        return ApiResponse::success($role->fresh(), 'permissions.updated');
    }

    public function destroy(Role $role)
    {
        $this->authorizeRole($role);
        $role->delete();
        return ApiResponse::success(null, 'permissions.deleted');
    }

    public function trashed()
    {
        $companyId = request()->user()->company_id;
        $q = request('q') ?? request('search');
        $roles = Role::onlyTrashed()->where('company_id', $companyId)
            ->search($q)
            ->get();
        return ApiResponse::success($roles, 'permissions.trashed');
    }

    public function restore($id)
    {
        $companyId = request()->user()->company_id;
        $role = Role::withTrashed()->where('company_id', $companyId)->findOrFail($id);
        $role->restore();
        return ApiResponse::success($role, 'permissions.restored');
    }

    public function forceDelete($id)
    {
        $companyId = request()->user()->company_id;
        $role = Role::withTrashed()->where('company_id', $companyId)->findOrFail($id);
        $role->forceDelete();
        return ApiResponse::success(null, 'permissions.force_deleted');
    }

    private function authorizeRole(Role $role): void
    {
        if ($role->company_id !== request()->user()->company_id) {
            abort(403);
        }
    }

}


