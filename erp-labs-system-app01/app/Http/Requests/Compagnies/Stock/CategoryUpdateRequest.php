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
        ];
    }
}


