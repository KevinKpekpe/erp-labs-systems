<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Models\Concerns\Searchable;

class Patient extends Model
{
    use HasFactory, SoftDeletes, Searchable;

    protected $table = 'patients';

    protected $fillable = [
        'company_id',
        'code',
        'nom',
        'postnom',
        'prenom',
        'email',
        'date_naissance',
        'sexe',
        'adresse',
        'contact',
        'type_patient_id',
        'medecin_resident_id',
    ];

    /** @var list<string> */
    protected array $searchable = [
        'code', 'nom', 'postnom', 'prenom', 'email', 'adresse', 'contact'
    ];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function type()
    {
        return $this->belongsTo(PatientType::class, 'type_patient_id');
    }

    public function medecinResident()
    {
        return $this->belongsTo(Doctor::class, 'medecin_resident_id');
    }
}


