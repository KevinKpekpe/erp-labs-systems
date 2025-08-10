<?php

namespace App\Http\Requests\Compagnies;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class RoleStoreRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'nom_role' => [
                'required', 'string', 'max:100',
                Rule::unique('roles', 'nom_role')->where(function ($q) {
                    return $q->where('company_id', $this->user()?->company_id);
                }),
            ],
            // permissions: tableau d'IDs uniquement
            'permissions' => ['sometimes', 'array'],
            'permissions.*' => ['integer', 'exists:permissions,id'],
        ];
    }
}


