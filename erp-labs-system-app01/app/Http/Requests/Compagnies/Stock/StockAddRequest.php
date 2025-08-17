<?php

namespace App\Http\Requests\Compagnies\Stock;

use Illuminate\Foundation\Http\FormRequest;

class StockAddRequest extends FormRequest
{
	public function authorize(): bool { return true; }

	public function rules(): array
	{
		return [
			'quantite' => ['required','integer','min:1'],
			'date_mouvement' => ['sometimes','date'],
			'motif' => ['sometimes','string','nullable'],
		];
	}
}
