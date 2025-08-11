<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Models\Concerns\Searchable;

class ExamRequest extends Model
{
    use HasFactory, SoftDeletes, Searchable;

    protected $table = 'demande_examens';

    protected $fillable = [
        'company_id',
        'code',
        'patient_id',
        'medecin_prescripteur_id',
        'medecin_prescripteur_externe_nom',
        'medecin_prescripteur_externe_prenom',
        'date_demande',
        'statut_demande',
        'note',
    ];

    /** @var list<string> */
    protected array $searchable = [
        'code', 'statut_demande', 'note'
    ];

    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }

    public function medecin()
    {
        return $this->belongsTo(Doctor::class, 'medecin_prescripteur_id');
    }

    public function details()
    {
        return $this->hasMany(ExamRequestDetail::class, 'demande_id');
    }
}


