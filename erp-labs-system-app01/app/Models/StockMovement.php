<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Models\Concerns\Searchable;

class StockMovement extends Model
{
    use HasFactory, SoftDeletes, Searchable;

    protected $table = 'mouvement_stocks';

    protected $fillable = [
        'company_id',
        'code',
        'stock_id',
        'stock_lot_id',
        'date_mouvement',
        'quantite',
        'type_mouvement',
        'prix_unitaire_mouvement',
        'demande_id',
        'motif',
    ];

    protected $casts = [
        'date_mouvement' => 'datetime',
        'prix_unitaire_mouvement' => 'decimal:2',
    ];

    /** @var list<string> */
    protected array $searchable = ['code', 'motif'];

    public function stock()
    {
        return $this->belongsTo(Stock::class);
    }

    public function stockLot()
    {
        return $this->belongsTo(StockLot::class);
    }

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    // Scopes utiles
    public function scopeEntrees($query)
    {
        return $query->where('type_mouvement', 'Entrée');
    }

    public function scopeSorties($query)
    {
        return $query->where('type_mouvement', 'Sortie');
    }

    public function scopeForArticle($query, $articleId)
    {
        return $query->whereHas('stock', function($q) use ($articleId) {
            $q->where('article_id', $articleId);
        });
    }

    // Méthodes utiles
    public function isEntree()
    {
        return $this->type_mouvement === 'Entrée';
    }

    public function isSortie()
    {
        return $this->type_mouvement === 'Sortie';
    }

    public function getValeurTotaleAttribute()
    {
        return $this->quantite * ($this->prix_unitaire_mouvement ?? 0);
    }
}


