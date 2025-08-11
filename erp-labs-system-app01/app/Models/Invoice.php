<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Models\Concerns\Searchable;

class Invoice extends Model
{
    use HasFactory, SoftDeletes, Searchable;

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

    /** @var list<string> */
    protected array $searchable = [
        'code', 'statut_facture'
    ];

    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }

    public function details()
    {
        return $this->hasMany(InvoiceDetail::class, 'facture_id');
    }

    public function payments()
    {
        return $this->hasMany(Payment::class, 'facture_id');
    }
}


