<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Article extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'articles';

    protected $fillable = [
        'company_id',
        'code',
        'categorie_id',
        'nom_article',
        'description',
        'fournisseur',
        'prix_unitaire',
        'unite_mesure',
    ];
}


