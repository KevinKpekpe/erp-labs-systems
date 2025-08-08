<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Exam extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'examens';

    protected $fillable = [
        'company_id',
        'code',
        'nom_examen',
        'description',
        'prix',
        'delai_rendu_estime',
        'unites_mesure',
        'valeurs_reference',
        'type_echantillon',
        'conditions_pre_analytiques',
        'equipement_reactifs_necessaires',
    ];
}


