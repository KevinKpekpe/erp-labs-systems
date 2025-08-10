<?php

namespace App\Http\Requests\Compagnies;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class RoleUpdateRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'nom_role' => [
                'sometimes', 'string', 'max:100',
                Rule::unique('roles', 'nom_role')->where(function ($q) {
                    return $q->where('company_id', $this->user()?->company_id);
                })->ignore($this->route('role')?->id),
            ],
            'permissions' => ['sometimes', 'array'],
            'permissions.*' => ['integer', 'exists:permissions,id'],
        ];
    }
}


