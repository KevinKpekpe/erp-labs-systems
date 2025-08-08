<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class CategoryArticle extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'categorie_articles';

    protected $fillable = [
        'company_id',
        'code',
        'nom_categorie',
    ];
}


