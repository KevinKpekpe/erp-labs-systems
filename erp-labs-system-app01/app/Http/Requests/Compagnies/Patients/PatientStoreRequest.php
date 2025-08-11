<?php

namespace App\Http\Requests\Compagnies\Patients;

use Illuminate\Foundation\Http\FormRequest;

class PatientStoreRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'nom' => ['required','string','max:100'],
            'postnom' => ['sometimes','string','max:100','nullable'],
            'prenom' => ['required','string','max:100'],
            'email' => ['sometimes','email','max:100','nullable'],
            'date_naissance' => ['required','date'],
            'sexe' => ['required','in:M,F'],
            'adresse' => ['required','string','max:255'],
            'contact' => ['required','string','max:100'],
            'type_patient_id' => ['required','integer','exists:type_patients,id'],
            'medecin_resident_id' => ['sometimes','integer','exists:medecins,id','nullable'],
        ];
    }
}


