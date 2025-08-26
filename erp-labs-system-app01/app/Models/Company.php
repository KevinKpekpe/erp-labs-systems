<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Models\Concerns\Searchable;

class Company extends Model
{
    use HasFactory, SoftDeletes, Searchable;

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

    /** @var list<string> */
    protected array $searchable = [
        'code', 'nom_company', 'adresse', 'email', 'contact', 'secteur_activite', 'type_etablissement', 'description'
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

    public function getAdminUserAttribute()
    {
        return $this->users()
            ->whereHas('roles', function ($query) {
                $query->where('nom_role', 'ADMIN');
            })
            ->select('id', 'username', 'email', 'nom', 'postnom')
            ->first();
    }

    public function patients()
    {
        return $this->hasMany(Patient::class);
    }
}


