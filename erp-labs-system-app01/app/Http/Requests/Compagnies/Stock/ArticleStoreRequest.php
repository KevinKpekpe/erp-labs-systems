<?php

namespace App\Http\Requests\Compagnies\Stock;

use Illuminate\Foundation\Http\FormRequest;

class ArticleStoreRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        $companyId = $this->user()?->company_id;
        return [
            'categorie_id' => ['required','integer','exists:categorie_articles,id'],
            'nom_article' => ['required','string','max:255'],
            'description' => ['sometimes','string','nullable'],
            'fournisseur' => ['sometimes','string','max:255','nullable'],
            'prix_unitaire' => ['required','numeric','min:0'],
            'unite_mesure' => ['required','string','max:50'],
        ];
    }
}


