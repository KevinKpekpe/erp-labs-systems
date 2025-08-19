<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Models\Concerns\Searchable;
use Carbon\Carbon;

class StockAlert extends Model
{
    use HasFactory, SoftDeletes, Searchable;

    protected $table = 'alerte_stocks';

    protected $fillable = [
        'company_id',
        'code',
        'stock_id',
        'lot_id',
        'type',
        'priorite',
        'titre',
        'message',
        'date_alerte',
        'date_traitement',
        'statut',
        'quantite_actuelle',
        'seuil_critique',
        'message_alerte',
    ];

    protected $casts = [
        'date_alerte' => 'datetime',
        'date_traitement' => 'datetime',
        'priorite' => 'string',
        'statut' => 'string',
    ];

    /** @var list<string> */
    protected array $searchable = [
        'code',
        'titre',
        'message',
        'message_alerte'
    ];

    // Constantes pour les types d'alertes
    const TYPE_STOCK_CRITIQUE = 'stock_critique';
    const TYPE_EXPIRATION_PROCHE = 'expiration_proche';
    const TYPE_LOT_EXPIRE = 'lot_expire';
    const TYPE_CHAINE_FROID = 'chaine_froid';
    const TYPE_TEMPERATURE = 'temperature';

    // Constantes pour les priorités
    const PRIORITE_HAUTE = 'haute';
    const PRIORITE_MOYENNE = 'moyenne';
    const PRIORITE_FAIBLE = 'faible';

    // Constantes pour les statuts
    const STATUT_NOUVEAU = 'nouveau';
    const STATUT_EN_COURS = 'en_cours';
    const STATUT_TRAITE = 'traite';
    const STATUT_IGNORE = 'ignore';

    public function stock()
    {
        return $this->belongsTo(Stock::class);
    }

    public function lot()
    {
        return $this->belongsTo(StockLot::class);
    }

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    // Scopes pour les filtres
    public function scopeByType($query, $type)
    {
        return $query->when($type, function($q) use ($type) {
            return $q->where('type', $type);
        });
    }

    public function scopeByPriorite($query, $priorite)
    {
        return $query->when($priorite, function($q) use ($priorite) {
            return $q->where('priorite', $priorite);
        });
    }

    public function scopeByStatut($query, $statut)
    {
        return $query->when($statut, function($q) use ($statut) {
            return $q->where('statut', $statut);
        });
    }

    public function scopeByDateRange($query, $dateDebut, $dateFin)
    {
        return $query->when($dateDebut, function($q) use ($dateDebut) {
            return $q->whereDate('date_alerte', '>=', $dateDebut);
        })->when($dateFin, function($q) use ($dateFin) {
            return $q->whereDate('date_alerte', '<=', $dateFin);
        });
    }

    public function scopeByStock($query, $stockId)
    {
        return $query->when($stockId, function($q) use ($stockId) {
            return $q->where('stock_id', $stockId);
        });
    }

    public function scopeByLot($query, $lotId)
    {
        return $query->when($lotId, function($q) use ($lotId) {
            return $q->where('lot_id', $lotId);
        });
    }

    public function scopeActive($query)
    {
        return $query->whereIn('statut', [self::STATUT_NOUVEAU, self::STATUT_EN_COURS]);
    }

    public function scopeCritical($query)
    {
        return $query->where('priorite', self::PRIORITE_HAUTE);
    }

    // Accesseurs
    public function getIsActiveAttribute()
    {
        return in_array($this->statut, [self::STATUT_NOUVEAU, self::STATUT_EN_COURS]);
    }

    public function getIsCriticalAttribute()
    {
        return $this->priorite === self::PRIORITE_HAUTE;
    }

    public function getDaysSinceCreationAttribute()
    {
        return $this->date_alerte ? Carbon::now()->diffInDays($this->date_alerte) : 0;
    }

    public function getIsOverdueAttribute()
    {
        return $this->isActive && $this->days_since_creation > 7;
    }
}
