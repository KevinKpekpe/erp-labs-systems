<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Models\Concerns\Searchable;
use Carbon\Carbon;

class StockLot extends Model
{
    use HasFactory, SoftDeletes, Searchable;

    protected $table = 'stock_lots';

    protected $fillable = [
        'company_id',
        'code',
        'article_id',
        'quantite_initiale',
        'quantite_restante',
        'date_entree',
        'date_expiration',
        'prix_unitaire_achat',
        'numero_lot',
        'fournisseur_lot',
        'commentaire',
    ];

    protected $casts = [
        'date_entree' => 'datetime',
        'date_expiration' => 'date',
        'prix_unitaire_achat' => 'decimal:2',
    ];

    /** @var list<string> */
    protected array $searchable = [
        'code',
        'numero_lot',
        'fournisseur_lot',
        'commentaire'
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

    public function movements()
    {
        return $this->hasMany(StockMovement::class);
    }

    // Scopes utiles pour FIFO
    public function scopeAvailable($query)
    {
        return $query->where('quantite_restante', '>', 0);
    }

    public function scopeFifoOrder($query)
    {
        return $query->orderBy('date_entree', 'asc');
    }

    public function scopeFefoOrder($query)
    {
        return $query->orderBy('date_expiration', 'asc')->orderBy('date_entree', 'asc');
    }

    public function scopeForArticle($query, $articleId)
    {
        return $query->where('article_id', $articleId);
    }

    public function scopeForCompany($query, $companyId)
    {
        return $query->where('company_id', $companyId);
    }

    // Méthodes utiles
    public function isExpired()
    {
        return $this->date_expiration && Carbon::now()->gt($this->date_expiration);
    }

    public function isNearExpiration($days = 30)
    {
        return $this->date_expiration &&
               Carbon::now()->addDays($days)->gte($this->date_expiration);
    }

    public function getQuantiteConsommeeAttribute()
    {
        return $this->quantite_initiale - $this->quantite_restante;
    }

    public function getPourcentageConsommationAttribute()
    {
        if ($this->quantite_initiale == 0) return 0;
        return round(($this->quantite_consommee / $this->quantite_initiale) * 100, 2);
    }

    public function isFullyConsumed()
    {
        return $this->quantite_restante <= 0;
    }

    public function canProvide($quantite)
    {
        return $this->quantite_restante >= $quantite;
    }

    public function consume($quantite)
    {
        if ($quantite > $this->quantite_restante) {
            throw new \InvalidArgumentException("Quantité demandée ({$quantite}) supérieure à la quantité disponible ({$this->quantite_restante})");
        }

        $this->quantite_restante -= $quantite;
        return $this;
    }
}
