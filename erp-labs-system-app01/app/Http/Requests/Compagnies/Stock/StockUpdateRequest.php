<?php

namespace App\Http\Requests\Compagnies\Stock;

use Illuminate\Foundation\Http\FormRequest;

class StockUpdateRequest extends FormRequest
{
	public function authorize(): bool { return true; }

	public function rules(): array
	{
		return [
			'article_id' => ['sometimes','integer','exists:articles,id'],
			'seuil_critique' => ['sometimes','integer','min:0'],
			'date_expiration' => ['sometimes','date','nullable'],
		];
	}
}


