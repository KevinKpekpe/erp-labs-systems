<?php

namespace App\Http\Requests\Compagnies\Exams;

use Illuminate\Foundation\Http\FormRequest;

class ExamRequestStoreRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'patient_id' => ['required','integer','exists:patients,id'],
            'medecin_prescripteur_id' => ['sometimes','integer','exists:medecins,id','nullable'],
            'medecin_prescripteur_externe_nom' => ['sometimes','string','max:100','nullable'],
            'medecin_prescripteur_externe_prenom' => ['sometimes','string','max:100','nullable'],
            'date_demande' => ['sometimes','date'],
            'note' => ['sometimes','string','nullable'],
            'examens' => ['required','array','min:1'],
            'examens.*' => ['integer','exists:examens,id'],
        ];
    }
}


