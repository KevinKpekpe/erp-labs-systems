<?php

namespace App\Http\Requests\Compagnies\Exams;

use Illuminate\Foundation\Http\FormRequest;

class ExamRequestDetailUpdateRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'resultat' => ['sometimes','string','nullable'],
            'date_resultat' => ['sometimes','date','nullable'],
        ];
    }
}



