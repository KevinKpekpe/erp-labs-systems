<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Company extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'companies';

    protected $fillable = [
        'code',
        'nom_company',
        'adresse',
        'email',
        'contact',
        'logo',
        'secteur_activite',
        'type_etablissement',
        'description',
    ];

    // Relations
    public function users()
    {
        return $this->hasMany(User::class);
    }

    public function roles()
    {
        return $this->hasMany(Role::class);
    }

    public function patients()
    {
        return $this->hasMany(Patient::class);
    }
}


