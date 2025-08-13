<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\Company;
use App\Models\PatientType;
use App\Models\Doctor;
use App\Models\Patient;
use App\Models\Exam;
use App\Models\Article;
use App\Support\CodeGenerator;

class MedicalSeeder extends Seeder
{
    public function run(): void
    {
        $rdcFirst = ['Kabelo','Kamal','Mukendi','Ilunga','Kanku','Kazadi','Mumbere','Lokenga','Kisangani','Bakamba'];
        $rdcLast = ['Kabasele','Kabeya','Lutumba','Tshibangu','Kalala','Masika','Mutombo','Kasongo','Bisimwa','Mujinga'];
        foreach (Company::all() as $company) {
            // Types patient (3)
            foreach (['REGULIER','ASSURE','VIP'] as $label) {
                PatientType::firstOrCreate([
                    'company_id' => $company->id,
                    'nom_type' => $label.'-'.$company->id,
                ], [
                    'code' => CodeGenerator::generate('type_patients', $company->id, 'PT'),
                    'description' => null,
                ]);
            }
            $types = PatientType::where('company_id',$company->id)->pluck('id')->all();

            // Médecins (4)
            for ($i=0;$i<4;$i++) {
                Doctor::create([
                    'company_id' => $company->id,
                    'code' => CodeGenerator::generate('medecins', $company->id, 'DOC'),
                    'nom' => $rdcLast[$i%count($rdcLast)],
                    'prenom' => $rdcFirst[$i%count($rdcFirst)],
                    'date_naissance' => '1980-01-01',
                    'sexe' => $i%2===0?'M':'F',
                    'contact' => '+24389'.rand(1000000,9999999),
                    'numero_identification' => 'MD-'.rand(1000,9999),
                ]);
            }
            $doctorIds = Doctor::where('company_id',$company->id)->pluck('id')->all();

            // Patients (5)
            for ($i=0;$i<5;$i++) {
                Patient::create([
                    'company_id' => $company->id,
                    'code' => CodeGenerator::generate('patients', $company->id, 'PAT'),
                    'nom' => $rdcLast[$i%count($rdcLast)],
                    'postnom' => 'N.',
                    'prenom' => $rdcFirst[($i+3)%count($rdcFirst)],
                    'email' => null,
                    'date_naissance' => '1990-01-01',
                    'sexe' => $i%2===0?'M':'F',
                    'adresse' => 'Commune de Ngaliema',
                    'contact' => '+24399'.rand(1000000,9999999),
                    'type_patient_id' => $types[array_rand($types)],
                    'medecin_resident_id' => $doctorIds[array_rand($doctorIds)],
                ]);
            }

            // Examens (quelques uns) liés au premier article disponible si existe
            $article = Article::where('company_id',$company->id)->first();
            foreach ([
                ['Hemoglobine', 12.5, 'g/dL'],
                ['Glycemie', 8.0, 'mg/dL'],
                ['CRP', 10.0, 'mg/L'],
            ] as [$name,$price,$unit]) {
                $exam = Exam::create([
                    'company_id' => $company->id,
                    'code' => CodeGenerator::generate('examens', $company->id, 'EXM'),
                    'nom_examen' => $name,
                    'description' => '',
                    'prix' => $price,
                    'delai_rendu_estime' => 24,
                    'unites_mesure' => $unit,
                    'valeurs_reference' => '',
                    'type_echantillon' => 'Sang',
                    'conditions_pre_analytiques' => '',
                ]);
                if ($article) {
                    DB::table('examen_articles')->insert([
                        'company_id' => $company->id,
                        'examen_id' => $exam->id,
                        'article_id' => $article->id,
                        'quantite_utilisee' => 1,
                        'created_at' => now(), 'updated_at' => now()
                    ]);
                }
            }
        }
    }
}


