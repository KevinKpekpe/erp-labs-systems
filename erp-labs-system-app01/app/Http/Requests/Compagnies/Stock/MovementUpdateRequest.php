<?php

namespace App\Http\Requests\Compagnies\Stock;

use Illuminate\Foundation\Http\FormRequest;

class MovementUpdateRequest extends FormRequest
{
	public function authorize(): bool { return true; }

	public function rules(): array
	{
		return [
			'quantite' => ['sometimes','integer','min:1'],
			'type_mouvement' => ['sometimes','in:Entrée,Sortie'],
			'date_mouvement' => ['sometimes','date'],
			'motif' => ['sometimes','string','nullable'],
		];
	}
}
