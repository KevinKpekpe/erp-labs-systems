<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Models\Concerns\Searchable;

class CategoryArticle extends Model
{
    use HasFactory, SoftDeletes, Searchable;

    protected $table = 'categorie_articles';

    protected $fillable = [
        'company_id',
        'code',
        'nom_categorie',
    ];

    /** @var list<string> */
    protected array $searchable = [
        'code', 'nom_categorie'
    ];
}


