<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Invoice extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'factures';

    protected $fillable = [
        'company_id',
        'code',
        'demande_id',
        'patient_id',
        'date_facture',
        'montant_total',
        'statut_facture',
    ];
}


