<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class LoginRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'company_code' => ['required', 'integer'],
            'login' => ['required', 'string'], // username or email
            'password' => ['required', 'string'],
        ];
    }
}


