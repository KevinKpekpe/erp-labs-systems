<?php

namespace App\Http\Requests\Compagnies\Stock;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CategoryUpdateRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        $companyId = $this->user()?->company_id;
        $category = $this->route('category');
        $ignoreId = is_object($category) ? $category->id : null;
        return [
            'nom_categorie' => [
                'required','string','max:100',
                Rule::unique('categorie_articles','nom_categorie')
                    ->ignore($ignoreId)
                    ->where(fn($q) => $q->where('company_id', $companyId)),
            ],
            'type_laboratoire' => 'nullable|string|in:Réactifs,Consommables,Équipements,Contrôles,Références,Kits,Autre',
            'conditions_stockage_requises' => 'nullable|string|max:500',
            'temperature_stockage_min' => 'nullable|numeric',
            'temperature_stockage_max' => 'nullable|numeric',
            'humidite_max' => 'nullable|numeric|min:0|max:100',
            'sensible_lumiere' => 'boolean',
            'chaine_froid_critique' => 'boolean',
            'delai_alerte_expiration' => 'integer|min:1|max:365',
        ];
    }
}


