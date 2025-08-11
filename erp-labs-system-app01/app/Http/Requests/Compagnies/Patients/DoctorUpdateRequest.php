<?php

namespace App\Http\Requests\Compagnies\Patients;

use Illuminate\Foundation\Http\FormRequest;

class DoctorUpdateRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'nom' => ['sometimes','string','max:100'],
            'prenom' => ['sometimes','string','max:100'],
            'date_naissance' => ['sometimes','date'],
            'sexe' => ['sometimes','in:M,F'],
            'contact' => ['sometimes','string','max:100'],
            'numero_identification' => ['sometimes','string','max:100'],
        ];
    }
}


