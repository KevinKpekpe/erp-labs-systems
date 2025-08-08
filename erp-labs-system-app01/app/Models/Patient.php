<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Patient extends Model
{
    use HasFactory, SoftDeletes;

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


