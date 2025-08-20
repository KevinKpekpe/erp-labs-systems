<?php

namespace App\Http\Requests\Compagnies\Patients;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class PatientTypeStoreRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        $companyId = $this->user()?->company_id;
        return [
            'nom_type' => [
                'required','string','max:100',
                Rule::unique('type_patients','nom_type')
                    ->where(fn($q) => $q->where('company_id', $companyId)->whereNull('deleted_at')),
            ],
            'description' => ['sometimes','string','nullable'],
        ];
    }
}


