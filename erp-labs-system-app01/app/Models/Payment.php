<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Payment extends Model
{
    use HasFactory, SoftDeletes;

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
}


