<?php

namespace App\Http\Requests\SuperAdmin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'nullable', 'string', 'max:100'],
            'username' => ['sometimes', 'string', 'max:100'],
            'email' => ['sometimes', 'email', 'max:255'],
            'telephone' => ['sometimes', 'nullable', 'string', 'max:50'],
            'sexe' => ['sometimes', 'nullable', 'in:M,F'],
            'photo_de_profil' => ['sometimes', 'nullable', 'file', 'image', 'max:5120'],
            'remove_photo' => ['sometimes', 'boolean'],
        ];
    }
}


