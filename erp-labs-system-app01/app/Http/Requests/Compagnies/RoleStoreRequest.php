<?php

namespace App\Http\Requests\Compagnies;

use Illuminate\Foundation\Http\FormRequest;

class RoleStoreRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'nom_role' => ['required', 'string', 'max:100'],
            // permissions as array of codes or ids
            'permissions' => ['sometimes', 'array'],
            'permissions.*' => ['string'],
        ];
    }
}


