<?php

namespace App\Http\Requests\Compagnies\Patients;

use Illuminate\Foundation\Http\FormRequest;

class PatientUpdateRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'nom' => ['sometimes','string','max:100'],
            'postnom' => ['sometimes','string','max:100','nullable'],
            'prenom' => ['sometimes','string','max:100'],
            'email' => ['sometimes','email','max:100','nullable'],
            'date_naissance' => ['sometimes','date'],
            'sexe' => ['sometimes','in:M,F'],
            'adresse' => ['sometimes','string','max:255'],
            'contact' => ['sometimes','string','max:100'],
            'type_patient_id' => ['sometimes','integer','exists:type_patients,id'],
            'medecin_resident_id' => ['sometimes','integer','exists:medecins,id','nullable'],
        ];
    }
}


