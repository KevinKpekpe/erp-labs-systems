<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class StockMovement extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'mouvement_stocks';

    protected $fillable = [
        'company_id',
        'code',
        'stock_id',
        'date_mouvement',
        'quantite',
        'type_mouvement',
        'demande_id',
        'motif',
    ];
}


