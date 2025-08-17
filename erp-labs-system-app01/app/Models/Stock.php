<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Models\Concerns\Searchable;

class Stock extends Model
{
    use HasFactory, SoftDeletes, Searchable;

    protected $table = 'stocks';

    protected $fillable = [
        'company_id',
        'code',
        'article_id',
        'quantite_actuelle',
        'seuil_critique',
        'date_expiration',
    ];

    /** @var list<string> */
    protected array $searchable = [
        'code'
    ];

    public function article()
    {
        return $this->belongsTo(Article::class);
    }
}


