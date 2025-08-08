<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ExamRequestDetail extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'demande_examen_details';

    protected $fillable = [
        'company_id',
        'code',
        'demande_id',
        'examen_id',
        'resultat',
        'date_resultat',
    ];

    public function demande()
    {
        return $this->belongsTo(ExamRequest::class, 'demande_id');
    }

    public function examen()
    {
        return $this->belongsTo(Exam::class, 'examen_id');
    }
}


