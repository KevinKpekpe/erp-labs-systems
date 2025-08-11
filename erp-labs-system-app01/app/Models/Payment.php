<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Models\Concerns\Searchable;

class Payment extends Model
{
    use HasFactory, SoftDeletes, Searchable;

    protected $table = 'paiements';

    protected $fillable = [
        'company_id',
        'code',
        'facture_id',
        'date_paiement',
        'montant_paye',
        'methode_paiement',
        'reference_paiement',
    ];

    /** @var list<string> */
    protected array $searchable = [
        'code', 'methode_paiement', 'reference_paiement'
    ];

    public function invoice()
    {
        return $this->belongsTo(Invoice::class, 'facture_id');
    }
}


