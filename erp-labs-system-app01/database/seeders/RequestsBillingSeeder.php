<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\Company;
use App\Models\Patient;
use App\Models\Doctor;
use App\Models\Exam;
use App\Models\ExamRequest;
use App\Models\Invoice;
use App\Models\Payment;
use App\Support\CodeGenerator;

class RequestsBillingSeeder extends Seeder
{
    public function run(): void
    {
        foreach (Company::all() as $company) {
            $patientIds = Patient::where('company_id',$company->id)->pluck('id')->all();
            $doctorIds = Doctor::where('company_id',$company->id)->pluck('id')->all();
            $examIds = Exam::where('company_id',$company->id)->pluck('id')->all();
            if (empty($patientIds) || empty($doctorIds) || empty($examIds)) { continue; }

            for ($i=1;$i<=4;$i++) {
                $req = ExamRequest::create([
                    'company_id' => $company->id,
                    'code' => CodeGenerator::generate('demande_examens', $company->id, 'REQ'),
                    'patient_id' => $patientIds[array_rand($patientIds)],
                    'medecin_prescripteur_id' => $doctorIds[array_rand($doctorIds)],
                    'date_demande' => now()->subDays(rand(0,5)),
                    'statut_demande' => 'Terminée',
                ]);
                $chosen = array_slice($examIds, 0, rand(1, min(3, count($examIds))));
                $total = 0.0;
                foreach ($chosen as $exId) {
                    $price = Exam::find($exId)->prix;
                    DB::table('demande_examen_details')->insert([
                        'company_id' => $company->id,
                        'code' => CodeGenerator::generate('demande_examen_details', $company->id, 'RQD'),
                        'demande_id' => $req->id,
                        'examen_id' => $exId,
                        'resultat' => (string) (rand(10,15)),
                        'date_resultat' => now(),
                        'created_at' => now(), 'updated_at' => now()
                    ]);
                    $total += (float) $price;
                }
                $inv = Invoice::create([
                    'company_id' => $company->id,
                    'code' => CodeGenerator::generate('factures', $company->id, 'INV'),
                    'demande_id' => $req->id,
                    'patient_id' => $req->patient_id,
                    'date_facture' => now(),
                    'montant_total' => $total,
                    'statut_facture' => 'Partiellement payée'
                ]);
                foreach ($chosen as $exId) {
                    DB::table('facture_details')->insert([
                        'company_id' => $company->id,
                        'code' => CodeGenerator::generate('facture_details', $company->id, 'FD'),
                        'facture_id' => $inv->id,
                        'examen_id' => $exId,
                        'prix_unitaire_facture' => Exam::find($exId)->prix,
                        'created_at' => now(), 'updated_at' => now()
                    ]);
                }
                // Paiement partiel
                Payment::create([
                    'company_id' => $company->id,
                    'code' => CodeGenerator::generate('paiements', $company->id, 'PAY'),
                    'facture_id' => $inv->id,
                    'date_paiement' => now(),
                    'montant_paye' => $total/2,
                    'methode_paiement' => 'Caisse'
                ]);
            }
        }
    }
}


