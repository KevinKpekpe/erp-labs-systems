<?php

namespace App\Http\Requests\Compagnies\Stock;

use Illuminate\Foundation\Http\FormRequest;

class StockLotStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'article_id' => ['required', 'integer', 'exists:articles,id'],
            'quantite_initiale' => ['required', 'integer', 'min:1'],
            'date_entree' => ['nullable', 'date'],
            'date_expiration' => ['nullable', 'date', 'after:today'],
            'prix_unitaire_achat' => ['nullable', 'numeric', 'min:0'],
            'numero_lot' => ['nullable', 'string', 'max:100'],
            'fournisseur_lot' => ['nullable', 'string', 'max:255'],
            'commentaire' => ['nullable', 'string', 'max:1000'],
        ];
    }

    public function messages(): array
    {
        return [
            'article_id.required' => 'L\'article est obligatoire.',
            'article_id.exists' => 'L\'article sélectionné n\'existe pas.',
            'quantite_initiale.required' => 'La quantité initiale est obligatoire.',
            'quantite_initiale.min' => 'La quantité initiale doit être supérieure à 0.',
            'date_expiration.after' => 'La date d\'expiration doit être postérieure à aujourd\'hui.',
            'prix_unitaire_achat.min' => 'Le prix unitaire d\'achat doit être positif.',
            'numero_lot.max' => 'Le numéro de lot ne peut pas dépasser 100 caractères.',
            'fournisseur_lot.max' => 'Le fournisseur ne peut pas dépasser 255 caractères.',
            'commentaire.max' => 'Le commentaire ne peut pas dépasser 1000 caractères.',
        ];
    }
}
