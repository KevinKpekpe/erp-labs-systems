<?php

namespace App\Http\Requests\SuperAdmin;

use Illuminate\Foundation\Http\FormRequest;

class PermissionUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'action' => ['sometimes', 'string', 'max:50'],
            'module' => ['sometimes', 'string', 'max:50'],
        ];
    }
}


