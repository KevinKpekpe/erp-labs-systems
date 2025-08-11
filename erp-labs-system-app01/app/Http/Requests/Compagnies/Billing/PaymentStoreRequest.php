<?php

namespace App\Http\Requests\Compagnies\Billing;

use Illuminate\Foundation\Http\FormRequest;

class PaymentStoreRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'facture_id' => ['required','integer','exists:factures,id'],
            'date_paiement' => ['sometimes','date'],
            'montant_paye' => ['required','numeric','min:0.01'],
            'methode_paiement' => ['required','in:Carte bancaire,Caisse,Assurance'],
            'reference_paiement' => ['sometimes','string','max:100','nullable'],
        ];
    }
}


