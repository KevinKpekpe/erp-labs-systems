<?php

namespace App\Http\Requests\Compagnies\Stock;

use Illuminate\Foundation\Http\FormRequest;

class StockStoreRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'article_id' => ['required','integer','exists:articles,id'],
            'quantite_actuelle' => ['sometimes','integer','min:0'],
            'seuil_critique' => ['required','integer','min:0'],
        ];
    }
}


