<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Models\Concerns\Searchable;

class Article extends Model
{
    use HasFactory, SoftDeletes, Searchable;

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

    /** @var list<string> */
    protected array $searchable = [
        'code', 'nom_article', 'description', 'fournisseur', 'unite_mesure'
    ];

    // Relations
    public function category()
    {
        return $this->belongsTo(CategoryArticle::class, 'categorie_id');
    }
}


