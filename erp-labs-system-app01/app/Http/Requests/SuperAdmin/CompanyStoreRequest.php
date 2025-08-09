<?php

namespace App\Http\Requests\SuperAdmin;

use Illuminate\Foundation\Http\FormRequest;

class CompanyStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nom_company' => ['required', 'string', 'max:255'],
            'adresse' => ['required', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255'],
            'contact' => ['required', 'string', 'max:50'],
            'logo' => ['sometimes', 'nullable', 'file', 'image', 'max:5120'],
            'secteur_activite' => ['nullable', 'string', 'max:100'],
            'type_etablissement' => ['required', 'in:Public,Privé,Universitaire'],
            'description' => ['nullable', 'string'],

            // admin user initial
            'admin_username' => ['required', 'string', 'max:100'],
            'admin_email' => ['required', 'email', 'max:255'],
        ];
    }
}


