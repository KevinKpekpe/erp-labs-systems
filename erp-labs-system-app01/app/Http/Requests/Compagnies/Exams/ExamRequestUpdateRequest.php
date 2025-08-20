<?php

namespace App\Http\Requests\Compagnies\Exams;

use Illuminate\Foundation\Http\FormRequest;

class ExamRequestUpdateRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'statut_demande' => ['sometimes','in:En attente,En cours,Terminée,Annulée'],
            'methode_sortie' => ['sometimes','in:fifo,fefo'],
            'note' => ['sometimes','string','nullable'],
        ];
    }
}


