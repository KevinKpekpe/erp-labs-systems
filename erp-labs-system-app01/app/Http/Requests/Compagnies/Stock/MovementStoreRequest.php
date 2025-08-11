<?php

namespace App\Http\Requests\Compagnies\Stock;

use Illuminate\Foundation\Http\FormRequest;

class MovementStoreRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'stock_id' => ['required','integer','exists:stocks,id'],
            'quantite' => ['required','integer','min:1'],
            'type_mouvement' => ['required','in:Entrée,Sortie'],
            'date_mouvement' => ['sometimes','date'],
            'demande_id' => ['sometimes','integer','nullable'],
            'motif' => ['sometimes','string','nullable'],
        ];
    }
}


