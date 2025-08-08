<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class StockAlert extends Model
{
    use HasFactory, SoftDeletes;

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
}


