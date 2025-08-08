<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class EmployeeSchedule extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'horaire_employes';

    protected $fillable = [
        'company_id',
        'code',
        'employe_id',
        'date_horaire',
        'type_horaire',
        'heure_debut',
        'heure_fin',
    ];
}


