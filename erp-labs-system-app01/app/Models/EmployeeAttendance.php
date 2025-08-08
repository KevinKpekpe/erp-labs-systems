<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class EmployeeAttendance extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'presence_employes';

    protected $fillable = [
        'company_id',
        'code',
        'employe_id',
        'date_presence',
        'heure_entree',
        'heure_sortie',
    ];
}


