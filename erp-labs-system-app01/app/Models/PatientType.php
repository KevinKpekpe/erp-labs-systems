<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Models\Concerns\Searchable;

class PatientType extends Model
{
    use HasFactory, SoftDeletes, Searchable;

    protected $table = 'type_patients';

    protected $fillable = [
        'company_id',
        'code',
        'nom_type',
        'description',
    ];

    /** @var list<string> */
    protected array $searchable = [
        'code', 'nom_type', 'description'
    ];
}


