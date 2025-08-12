<?php

namespace App\Http\Controllers\Api\Compagnies\Patients;

use App\Http\Controllers\Controller;
use App\Http\Requests\Compagnies\Patients\PatientStoreRequest;
use App\Http\Requests\Compagnies\Patients\PatientUpdateRequest;
use App\Models\Doctor;
use App\Models\Patient;
use App\Models\PatientType;
use App\Models\ExamRequest;
use App\Support\ApiResponse;
use App\Support\CodeGenerator;

class PatientController extends Controller
{
    public function index()
    {
        $companyId = request()->user()->company_id;
        $q = request('q') ?? request('search');
        $perPage = (int) (request('per_page') ?? 15);
        $patients = Patient::where('company_id', $companyId)
            ->with(['type:id,nom_type','medecinResident:id,nom,prenom'])
            ->search($q)
            ->orderBy('nom')
            ->paginate($perPage);
        return ApiResponse::success($patients, 'patients.list');
    }

    public function store(PatientStoreRequest $request)
    {
        $companyId = $request->user()->company_id;
        $data = $request->validated();

        $type = PatientType::where('company_id', $companyId)->findOrFail($data['type_patient_id']);
        $resident = null;
        if (!empty($data['medecin_resident_id'])) {
            $resident = Doctor::where('company_id', $companyId)->findOrFail($data['medecin_resident_id']);
        }

        $patient = Patient::create([
            'company_id' => $companyId,
            'code' => CodeGenerator::generate('patients', $companyId, 'PAT'),
            'nom' => $data['nom'],
            'postnom' => $data['postnom'] ?? null,
            'prenom' => $data['prenom'],
            'email' => $data['email'] ?? null,
            'date_naissance' => $data['date_naissance'],
            'sexe' => $data['sexe'],
            'adresse' => $data['adresse'],
            'contact' => $data['contact'],
            'type_patient_id' => $type->id,
            'medecin_resident_id' => $resident?->id,
        ]);

        return ApiResponse::success($patient, 'patients.created', [], 201);
    }

    public function show(Patient $patient)
    {
        $this->authorizePatient($patient);
        $patient->load(['type:id,nom_type','medecinResident:id,nom,prenom']);
        // Récupérer les demandes du patient avec leurs détails et examens
        $requests = ExamRequest::where('company_id', $patient->company_id)
            ->where('patient_id', $patient->id)
            ->with([
                'medecin:id,nom,prenom',
                'details:id,demande_id,examen_id,resultat,date_resultat',
                'details.examen:id,nom_examen'
            ])
            ->orderByDesc('date_demande')
            ->get();
        $patient->setRelation('exam_requests', $requests);
        return ApiResponse::success($patient, 'patients.details');
    }

    public function update(PatientUpdateRequest $request, Patient $patient)
    {
        $this->authorizePatient($patient);
        $data = $request->validated();
        $payload = [];
        foreach (['nom','postnom','prenom','email','date_naissance','sexe','adresse','contact'] as $f) {
            if (array_key_exists($f, $data)) { $payload[$f] = $data[$f]; }
        }
        if (array_key_exists('type_patient_id', $data)) {
            $type = PatientType::where('company_id', $patient->company_id)->findOrFail($data['type_patient_id']);
            $payload['type_patient_id'] = $type->id;
        }
        if (array_key_exists('medecin_resident_id', $data)) {
            $resident = Doctor::where('company_id', $patient->company_id)->findOrFail($data['medecin_resident_id']);
            $payload['medecin_resident_id'] = $resident->id;
        }
        if ($payload) { $patient->update($payload); }
        return ApiResponse::success($patient->fresh(), 'patients.updated');
    }

    public function destroy(Patient $patient)
    {
        $this->authorizePatient($patient);
        $patient->delete();
        return ApiResponse::success(null, 'patients.deleted');
    }

    public function trashed()
    {
        $companyId = request()->user()->company_id;
        $q = request('q') ?? request('search');
        $perPage = (int) (request('per_page') ?? 15);
        $patients = Patient::onlyTrashed()->where('company_id', $companyId)
            ->search($q)->paginate($perPage);
        return ApiResponse::success($patients, 'patients.trashed');
    }

    public function restore($id)
    {
        $companyId = request()->user()->company_id;
        $patient = Patient::withTrashed()->where('company_id', $companyId)->findOrFail($id);
        $patient->restore();
        return ApiResponse::success($patient, 'patients.restored');
    }

    public function forceDelete($id)
    {
        $companyId = request()->user()->company_id;
        $patient = Patient::withTrashed()->where('company_id', $companyId)->findOrFail($id);
        $patient->forceDelete();
        return ApiResponse::success(null, 'patients.force_deleted');
    }

    private function authorizePatient(Patient $patient): void
    {
        if ($patient->company_id !== request()->user()->company_id) {
            abort(403);
        }
    }
}


