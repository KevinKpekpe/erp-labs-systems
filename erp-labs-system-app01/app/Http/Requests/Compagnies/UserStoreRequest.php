<?php

namespace App\Http\Requests\Compagnies;

use Illuminate\Foundation\Http\FormRequest;

class UserStoreRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'username' => ['required', 'string', 'max:100'],
            'email' => ['required', 'email', 'max:255'],
            'role_id' => ['required', 'integer'],
            'photo_de_profil' => ['sometimes', 'file', 'image', 'max:2048'],
        ];
    }
}


