<?php

namespace App\Http\Controllers\Api\Compagnies\Patients;

use App\Http\Controllers\Controller;
use App\Http\Requests\Compagnies\Patients\DoctorStoreRequest;
use App\Http\Requests\Compagnies\Patients\DoctorUpdateRequest;
use App\Models\Doctor;
use App\Support\ApiResponse;
use App\Support\CodeGenerator;

class DoctorController extends Controller
{
    public function index()
    {
        $companyId = request()->user()->company_id;
        $q = request('q') ?? request('search');
        $perPage = (int) (request('per_page') ?? 15);
        $doctors = Doctor::where('company_id', $companyId)
            ->search($q)
            ->orderBy('nom')
            ->paginate($perPage);
        return ApiResponse::success($doctors, 'patients.doctors.list');
    }

    public function store(DoctorStoreRequest $request)
    {
        $companyId = $request->user()->company_id;
        $data = $request->validated();
        $doctor = Doctor::create([
            'company_id' => $companyId,
            'code' => CodeGenerator::generate('medecins', $companyId, 'DOC'),
            'nom' => $data['nom'],
            'prenom' => $data['prenom'],
            'date_naissance' => $data['date_naissance'],
            'sexe' => $data['sexe'],
            'contact' => $data['contact'],
            'numero_identification' => $data['numero_identification'],
        ]);
        return ApiResponse::success($doctor, 'patients.doctors.created', [], 201);
    }

    public function show(Doctor $doctor)
    {
        $this->authorizeDoctor($doctor);
        return ApiResponse::success($doctor, 'patients.doctors.details');
    }

    public function update(DoctorUpdateRequest $request, Doctor $doctor)
    {
        $this->authorizeDoctor($doctor);
        $data = $request->validated();
        $doctor->update($data);
        return ApiResponse::success($doctor->fresh(), 'patients.doctors.updated');
    }

    public function destroy(Doctor $doctor)
    {
        $this->authorizeDoctor($doctor);
        $doctor->delete();
        return ApiResponse::success(null, 'patients.doctors.deleted');
    }

    public function trashed()
    {
        $companyId = request()->user()->company_id;
        $q = request('q') ?? request('search');
        $perPage = (int) (request('per_page') ?? 15);
        $doctors = Doctor::onlyTrashed()->where('company_id', $companyId)
            ->search($q)->paginate($perPage);
        return ApiResponse::success($doctors, 'patients.doctors.trashed');
    }

    public function restore($id)
    {
        $companyId = request()->user()->company_id;
        $doctor = Doctor::withTrashed()->where('company_id', $companyId)->findOrFail($id);
        $doctor->restore();
        return ApiResponse::success($doctor, 'patients.doctors.restored');
    }

    public function forceDelete($id)
    {
        $companyId = request()->user()->company_id;
        $doctor = Doctor::withTrashed()->where('company_id', $companyId)->findOrFail($id);
        $doctor->forceDelete();
        return ApiResponse::success(null, 'patients.doctors.force_deleted');
    }

    private function authorizeDoctor(Doctor $doctor): void
    {
        if ($doctor->company_id !== request()->user()->company_id) {
            abort(403);
        }
    }
}


