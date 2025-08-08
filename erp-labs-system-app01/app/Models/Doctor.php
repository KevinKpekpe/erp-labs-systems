<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Doctor extends Model
{
    use HasFactory, SoftDeletes;

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

    public function company()
    {
        return $this->belongsTo(Company::class);
    }
}


