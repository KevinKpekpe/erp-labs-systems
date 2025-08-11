<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class InvoiceDetail extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'facture_details';

    protected $fillable = [
        'company_id',
        'code',
        'facture_id',
        'examen_id',
        'prix_unitaire_facture',
    ];

    public function invoice()
    {
        return $this->belongsTo(Invoice::class, 'facture_id');
    }

    public function exam()
    {
        return $this->belongsTo(Exam::class, 'examen_id');
    }
}

