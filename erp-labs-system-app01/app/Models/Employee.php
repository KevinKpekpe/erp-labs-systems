<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Employee extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'employes';

    protected $fillable = [
        'company_id',
        'code',
        'matricule',
        'nom',
        'postnom',
        'prenom',
        'date_naissance',
        'sexe',
        'adresse',
        'contact',
        'poste',
        'service',
        'date_embauche',
    ];
}


