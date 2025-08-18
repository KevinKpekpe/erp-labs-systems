<?php

namespace App\Http\Requests\Compagnies\Stock;

use Illuminate\Foundation\Http\FormRequest;

class StockLotUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'date_expiration' => ['nullable', 'date'],
            'prix_unitaire_achat' => ['nullable', 'numeric', 'min:0'],
            'numero_lot' => ['nullable', 'string', 'max:100'],
            'fournisseur_lot' => ['nullable', 'string', 'max:255'],
            'commentaire' => ['nullable', 'string', 'max:1000'],
        ];
    }

    public function messages(): array
    {
        return [
            'prix_unitaire_achat.min' => 'Le prix unitaire d\'achat doit être positif.',
            'numero_lot.max' => 'Le numéro de lot ne peut pas dépasser 100 caractères.',
            'fournisseur_lot.max' => 'Le fournisseur ne peut pas dépasser 255 caractères.',
            'commentaire.max' => 'Le commentaire ne peut pas dépasser 1000 caractères.',
        ];
    }
}
