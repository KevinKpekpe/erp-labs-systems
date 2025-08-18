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

    protected $casts = [
        'date_expiration' => 'date',
    ];

    /** @var list<string> */
    protected array $searchable = [
        'code'
    ];

    // Relations
    public function article()
    {
        return $this->belongsTo(Article::class);
    }

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function stockLots()
    {
        return $this->hasMany(StockLot::class, 'article_id', 'article_id')
                    ->where('company_id', $this->company_id);
    }

    public function movements()
    {
        return $this->hasMany(StockMovement::class);
    }

    // Accesseurs pour calculer les quantités depuis les lots
    public function getQuantiteActuelleCalculeeAttribute()
    {
        return $this->stockLots()->sum('quantite_restante');
    }

    public function getQuantiteTotaleAttribute()
    {
        return $this->stockLots()->sum('quantite_initiale');
    }

    public function getValeurStockAttribute()
    {
        return $this->stockLots()
                    ->selectRaw('SUM(quantite_restante * COALESCE(prix_unitaire_achat, 0)) as valeur')
                    ->value('valeur') ?? 0;
    }

    // Scopes utiles
    public function scopeWithCalculatedQuantity($query)
    {
        return $query->addSelect([
            'quantite_calculee' => StockLot::selectRaw('SUM(quantite_restante)')
                ->whereColumn('article_id', 'stocks.article_id')
                ->whereColumn('company_id', 'stocks.company_id')
        ]);
    }

    public function scopeWithExpiredLots($query)
    {
        return $query->addSelect([
            'quantite_expiree' => StockLot::selectRaw('SUM(quantite_restante)')
                ->whereColumn('article_id', 'stocks.article_id')
                ->whereColumn('company_id', 'stocks.company_id')
                ->where('date_expiration', '<', now())
        ]);
    }

    public function scopeWithNearExpirationLots($query, $days = 30)
    {
        return $query->addSelect([
            'quantite_proche_expiration' => StockLot::selectRaw('SUM(quantite_restante)')
                ->whereColumn('article_id', 'stocks.article_id')
                ->whereColumn('company_id', 'stocks.company_id')
                ->whereBetween('date_expiration', [now(), now()->addDays($days)])
        ]);
    }

    // Méthodes utiles
    public function isLowStock()
    {
        return $this->quantite_actuelle_calculee <= $this->seuil_critique;
    }

    public function hasExpiredLots()
    {
        return $this->stockLots()->where('date_expiration', '<', now())->where('quantite_restante', '>', 0)->exists();
    }

    public function hasNearExpirationLots($days = 30)
    {
        return $this->stockLots()
                    ->whereBetween('date_expiration', [now(), now()->addDays($days)])
                    ->where('quantite_restante', '>', 0)
                    ->exists();
    }

    public function getAvailableLotsForFifo()
    {
        return $this->stockLots()
                    ->available()
                    ->fifoOrder();
    }

    public function getAvailableLotsForFefo()
    {
        return $this->stockLots()
                    ->available()
                    ->fefoOrder();
    }

    public function canProvide($quantite)
    {
        return $this->quantite_actuelle_calculee >= $quantite;
    }
}


