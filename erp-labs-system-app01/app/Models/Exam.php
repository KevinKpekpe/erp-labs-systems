<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Models\Concerns\Searchable;

class Exam extends Model
{
    use HasFactory, SoftDeletes, Searchable;

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

    /** @var list<string> */
    protected array $searchable = [
        'code', 'nom_examen', 'description', 'type_echantillon'
    ];

    public function articles()
    {
        return $this->belongsToMany(Article::class, 'examen_articles', 'examen_id', 'article_id')
            ->withPivot('quantite_utilisee');
    }
}


