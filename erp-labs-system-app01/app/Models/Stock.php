<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Stock extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'stocks';

    protected $fillable = [
        'company_id',
        'code',
        'article_id',
        'quantite_actuelle',
        'seuil_critique',
    ];
}


