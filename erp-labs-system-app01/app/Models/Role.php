<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Models\Concerns\Searchable;

class Role extends Model
{
    use HasFactory, SoftDeletes, Searchable;

    protected $table = 'roles';

    protected $fillable = [
        'company_id',
        'code',
        'nom_role',
    ];

    /** @var list<string> */
    protected array $searchable = [
        'code', 'nom_role'
    ];

    public function users()
    {
        return $this->belongsToMany(User::class, 'user_roles');
    }

    public function permissions()
    {
        return $this->belongsToMany(Permission::class, 'role_permissions', 'role_id', 'permission_id')
            ->withPivot(['company_id', 'code']);
    }
}


