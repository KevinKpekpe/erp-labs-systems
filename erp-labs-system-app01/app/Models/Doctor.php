<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Models\Concerns\Searchable;

class Doctor extends Model
{
    use HasFactory, SoftDeletes, Searchable;

    protected $table = 'medecins';

    protected $fillable = [
        'company_id',
        'code',
        'nom',
        'prenom',
        'date_naissance',
        'sexe',
        'contact',
        'numero_identification',
    ];

    /** @var list<string> */
    protected array $searchable = [
        'code', 'nom', 'prenom', 'contact', 'numero_identification'
    ];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }
}


