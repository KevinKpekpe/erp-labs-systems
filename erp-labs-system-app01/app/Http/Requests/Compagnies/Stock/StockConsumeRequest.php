<?php

namespace App\Http\Requests\Compagnies\Stock;

use Illuminate\Foundation\Http\FormRequest;

class StockConsumeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'quantite' => ['required', 'integer', 'min:1'],
            'date_mouvement' => ['nullable', 'date'],
            'motif' => ['nullable', 'string', 'max:500'],
            'demande_id' => ['nullable', 'integer', 'exists:demande_examens,id'],
            'methode_sortie' => ['in:fifo,fefo,manual'],
            'lots_manuels' => ['required_if:methode_sortie,manual', 'array'],
            'lots_manuels.*.lot_id' => ['required_with:lots_manuels', 'integer', 'exists:stock_lots,id'],
            'lots_manuels.*.quantite' => ['required_with:lots_manuels', 'integer', 'min:1'],
        ];
    }

    public function messages(): array
    {
        return [
            'quantite.required' => 'La quantité est obligatoire.',
            'quantite.min' => 'La quantité doit être supérieure à 0.',
            'methode_sortie.in' => 'La méthode de sortie doit être FIFO, FEFO ou manuelle.',
            'lots_manuels.required_if' => 'Les lots manuels sont obligatoires pour une sortie manuelle.',
            'lots_manuels.*.lot_id.exists' => 'Le lot sélectionné n\'existe pas.',
            'lots_manuels.*.quantite.min' => 'La quantité du lot doit être supérieure à 0.',
            'motif.max' => 'Le motif ne peut pas dépasser 500 caractères.',
        ];
    }
}
