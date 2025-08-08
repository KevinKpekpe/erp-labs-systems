<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ExamArticle extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'examen_articles';

    protected $fillable = [
        'company_id',
        'examen_id',
        'article_id',
        'quantite_utilisee',
    ];
}


