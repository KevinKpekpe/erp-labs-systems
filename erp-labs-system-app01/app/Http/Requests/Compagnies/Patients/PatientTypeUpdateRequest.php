<?php

namespace App\Http\Requests\Compagnies\Patients;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class PatientTypeUpdateRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        $companyId = $this->user()?->company_id;
        $type = $this->route('type');
        $ignoreId = is_object($type) ? $type->id : null;
        return [
            'nom_type' => [
                'required','string','max:100',
                Rule::unique('type_patients','nom_type')->ignore($ignoreId)->where(fn($q) => $q->where('company_id', $companyId)),
            ],
            'description' => ['sometimes','string','nullable'],
        ];
    }
}


