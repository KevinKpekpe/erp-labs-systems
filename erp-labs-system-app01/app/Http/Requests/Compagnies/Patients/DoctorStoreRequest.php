<?php

namespace App\Http\Requests\Compagnies\Patients;

use Illuminate\Foundation\Http\FormRequest;

class DoctorStoreRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'nom' => ['required','string','max:100'],
            'prenom' => ['required','string','max:100'],
            'date_naissance' => ['required','date'],
            'sexe' => ['required','in:M,F'],
            'contact' => ['required','string','max:100'],
            'numero_identification' => ['required','string','max:100'],
        ];
    }
}


