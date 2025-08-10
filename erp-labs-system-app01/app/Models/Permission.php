<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Models\Concerns\Searchable;

class Permission extends Model
{
    use HasFactory, SoftDeletes, Searchable;

    protected $table = 'permissions';

    protected $fillable = [
        'code',
        'action',
        'module',
    ];

    /** @var list<string> */
    protected array $searchable = [
        'code', 'action', 'module'
    ];

    public function roles()
    {
        return $this->belongsToMany(Role::class, 'role_permissions');
    }
}


