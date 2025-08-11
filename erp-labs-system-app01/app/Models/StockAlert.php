<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Models\Concerns\Searchable;

class StockAlert extends Model
{
    use HasFactory, SoftDeletes, Searchable;

    protected $table = 'alerte_stocks';

    protected $fillable = [
        'company_id',
        'code',
        'stock_id',
        'date_alerte',
        'quantite_actuelle',
        'seuil_critique',
        'message_alerte',
    ];

    /** @var list<string> */
    protected array $searchable = [
        'code', 'message_alerte'
    ];

    public function stock()
    {
        return $this->belongsTo(Stock::class);
    }
}
