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
        'type_laboratoire',
        'conditions_stockage_requises',
        'temperature_stockage_min',
        'temperature_stockage_max',
        'humidite_max',
        'sensible_lumiere',
        'chaine_froid_critique',
        'delai_alerte_expiration',
    ];

    protected $casts = [
        'temperature_stockage_min' => 'decimal:2',
        'temperature_stockage_max' => 'decimal:2',
        'humidite_max' => 'decimal:2',
        'sensible_lumiere' => 'boolean',
        'chaine_froid_critique' => 'boolean',
        'delai_alerte_expiration' => 'integer',
    ];

    /** @var list<string> */
    protected array $searchable = [
        'code', 'nom_categorie', 'type_laboratoire'
    ];

    // Relations
    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function articles()
    {
        return $this->hasMany(Article::class, 'categorie_id');
    }

    // Accesseurs pour les conditions de laboratoire
    public function getRequiresRefrigerationAttribute(): bool
    {
        return $this->temperature_stockage_max !== null && $this->temperature_stockage_max <= 8.0;
    }

    public function getRequiresFreezerAttribute(): bool
    {
        return $this->temperature_stockage_max !== null && $this->temperature_stockage_max <= -15.0;
    }

    public function getIsLaboratorySpecificAttribute(): bool
    {
        return !is_null($this->type_laboratoire);
    }

    // Scopes pour les requêtes de laboratoire
    public function scopeForLaboratoryType($query, $type)
    {
        return $query->where('type_laboratoire', $type);
    }

    public function scopeRequiringColdChain($query)
    {
        return $query->where('chaine_froid_critique', true);
    }

    public function scopeLightSensitive($query)
    {
        return $query->where('sensible_lumiere', true);
    }

    public function scopeWithTemperatureRange($query, $min = null, $max = null)
    {
        if ($min !== null) {
            $query->where('temperature_stockage_min', '>=', $min);
        }
        if ($max !== null) {
            $query->where('temperature_stockage_max', '<=', $max);
        }
        return $query;
    }
}


