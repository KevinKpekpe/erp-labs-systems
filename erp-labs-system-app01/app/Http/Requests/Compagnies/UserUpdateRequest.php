<?php

namespace App\Http\Requests\Compagnies;

use Illuminate\Foundation\Http\FormRequest;

class UserUpdateRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'username' => ['sometimes', 'string', 'max:100'],
            'nom' => ['sometimes', 'string', 'max:100'],
            'postnom' => ['sometimes', 'string', 'max:100'],
            'email' => ['sometimes', 'email', 'max:255'],
            'role_id' => ['sometimes', 'integer'],
            'is_active' => ['sometimes', 'boolean'],
            'telephone' => ['sometimes', 'string', 'max:50'],
            'sexe' => ['sometimes', 'in:M,F'],
            'photo_de_profil' => ['sometimes', 'file', 'image', 'max:2048'],
            'photo' => ['sometimes', 'file', 'image', 'max:2048'],
            'remove_photo' => ['sometimes', 'boolean'],
        ];
    }
}


