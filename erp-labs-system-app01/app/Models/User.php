<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Models\Concerns\Searchable;
use Illuminate\Support\Facades\Storage;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasApiTokens, HasFactory, Notifiable, SoftDeletes, Searchable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $table = 'users';
    protected $primaryKey = 'id';

    protected $fillable = [
        'company_id',
        'code',
        'username',
        'nom',
        'postnom',
        'password',
        'email',
        'telephone',
        'sexe',
        'photo_de_profil',
        'last_login',
        'is_active',
        'preferred_locale',
        'must_change_password',
    ];

    /** @var list<string> */
    protected array $searchable = [
        'code', 'username', 'nom', 'postnom', 'email', 'telephone', 'sexe', 'preferred_locale'
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'last_login' => 'datetime',
            'is_active' => 'boolean',
            'must_change_password' => 'boolean',
            'password' => 'hashed',
        ];
    }

    /** @var list<string> */
    protected $appends = ['photo_url'];

    // Relations
    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function roles()
    {
        return $this->belongsToMany(Role::class, 'user_roles');
    }

    public function getPhotoUrlAttribute(): ?string
    {
        if (!$this->photo_de_profil) {
            return null;
        }
        $relative = Storage::url($this->photo_de_profil); // ex: /storage/users/xyz.jpg
        $host = rtrim(request()->getSchemeAndHttpHost(), '/');
        return $host . $relative; // garde le slash initial de $relative
    }
}
