<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class PatientType extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'type_patients';

    protected $fillable = [
        'company_id',
        'code',
        'nom_type',
        'description',
    ];
}


