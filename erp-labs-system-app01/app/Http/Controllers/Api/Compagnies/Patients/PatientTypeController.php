<?php

namespace App\Http\Controllers\Api\Compagnies\Patients;

use App\Http\Controllers\Controller;
use App\Http\Requests\Compagnies\Patients\PatientTypeStoreRequest;
use App\Http\Requests\Compagnies\Patients\PatientTypeUpdateRequest;
use App\Models\PatientType;
use App\Support\ApiResponse;
use App\Support\CodeGenerator;

class PatientTypeController extends Controller
{
    public function index()
    {
        $companyId = request()->user()->company_id;
        $q = request('q') ?? request('search');
        $perPage = (int) (request('per_page') ?? 15);
        $types = PatientType::where('company_id', $companyId)
            ->search($q)
            ->orderBy('nom_type')
            ->paginate($perPage);
        return ApiResponse::success($types, 'patients.types.list');
    }

    public function store(PatientTypeStoreRequest $request)
    {
        $companyId = $request->user()->company_id;
        $data = $request->validated();
        $type = PatientType::create([
            'company_id' => $companyId,
            'code' => CodeGenerator::generate('type_patients', $companyId, 'PT'),
            'nom_type' => $data['nom_type'],
            'description' => $data['description'] ?? null,
        ]);
        return ApiResponse::success($type, 'patients.types.created', [], 201);
    }

    public function show(PatientType $type)
    {
        $this->authorizeType($type);
        return ApiResponse::success($type, 'patients.types.details');
    }

    public function update(PatientTypeUpdateRequest $request, PatientType $type)
    {
        $this->authorizeType($type);
        $data = $request->validated();
        $type->update([
            'nom_type' => $data['nom_type'],
            'description' => $data['description'] ?? null,
        ]);
        return ApiResponse::success($type->fresh(), 'patients.types.updated');
    }

    public function destroy(PatientType $type)
    {
        $this->authorizeType($type);
        $type->delete();
        return ApiResponse::success(null, 'patients.types.deleted');
    }

    public function trashed()
    {
        $companyId = request()->user()->company_id;
        $q = request('q') ?? request('search');
        $perPage = (int) (request('per_page') ?? 15);
        $types = PatientType::onlyTrashed()->where('company_id', $companyId)
            ->search($q)->paginate($perPage);
        return ApiResponse::success($types, 'patients.types.trashed');
    }

    public function restore($id)
    {
        $companyId = request()->user()->company_id;
        $type = PatientType::withTrashed()->where('company_id', $companyId)->findOrFail($id);
        $type->restore();
        return ApiResponse::success($type, 'patients.types.restored');
    }

    public function forceDelete($id)
    {
        $companyId = request()->user()->company_id;
        $type = PatientType::withTrashed()->where('company_id', $companyId)->findOrFail($id);
        $type->forceDelete();
        return ApiResponse::success(null, 'patients.types.force_deleted');
    }

    private function authorizeType(PatientType $type): void
    {
        if ($type->company_id !== request()->user()->company_id) {
            abort(403);
        }
    }
}


