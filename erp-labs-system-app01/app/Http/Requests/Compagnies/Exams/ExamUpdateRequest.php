<?php

namespace App\Http\Requests\Compagnies\Exams;

use Illuminate\Foundation\Http\FormRequest;

class ExamUpdateRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'nom_examen' => ['sometimes','string','max:255'],
            'description' => ['sometimes','string','nullable'],
            'prix' => ['sometimes','numeric','min:0'],
            'delai_rendu_estime' => ['sometimes','integer','min:0'],
            'unites_mesure' => ['sometimes','string','max:50'],
            'valeurs_reference' => ['sometimes','string','nullable'],
            'type_echantillon' => ['sometimes','string','max:100'],
            'conditions_pre_analytiques' => ['sometimes','string','nullable'],
            'equipement_reactifs_necessaires' => ['sometimes','string','nullable'],
            'articles' => ['sometimes','array'],
            'articles.*.article_id' => ['required_with:articles','integer','exists:articles,id'],
            'articles.*.quantite_utilisee' => ['required_with:articles','numeric','min:0'],
        ];
    }
}


