<?php

namespace App\Http\Requests\Compagnies;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCompanyRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nom_company' => ['sometimes', 'string', 'max:255'],
            'adresse' => ['sometimes', 'string', 'max:255'],
            'email' => ['sometimes', 'nullable', 'email', 'max:255'],
            'contact' => ['sometimes', 'string', 'max:50'],
            'logo' => ['sometimes', 'nullable', 'file', 'image', 'max:5120'],
            'remove_logo' => ['sometimes', 'boolean'],
            'secteur_activite' => ['sometimes', 'nullable', 'string', 'max:100'],
            'type_etablissement' => ['sometimes', 'in:Public,Privé,Universitaire'],
            'description' => ['sometimes', 'nullable', 'string'],
        ];
    }
}


