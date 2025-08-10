<?php

namespace App\Http\Requests\Compagnies\Stock;

use Illuminate\Foundation\Http\FormRequest;

class ArticleUpdateRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'categorie_id' => ['sometimes','integer','exists:categorie_articles,id'],
            'nom_article' => ['sometimes','string','max:255'],
            'description' => ['sometimes','string','nullable'],
            'fournisseur' => ['sometimes','string','max:255','nullable'],
            'prix_unitaire' => ['sometimes','numeric','min:0'],
            'unite_mesure' => ['sometimes','string','max:50'],
        ];
    }
}


