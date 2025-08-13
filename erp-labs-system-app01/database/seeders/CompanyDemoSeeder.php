<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use App\Models\Company;
use App\Models\Role;
use App\Models\User;
use App\Models\Permission;
use App\Models\CategoryArticle;
use App\Models\Article;
use App\Models\Stock;
use App\Models\StockMovement;
use App\Models\StockAlert;
use App\Models\Doctor;
use App\Models\PatientType;
use App\Models\Patient;
use App\Models\Exam;
use App\Models\ExamRequest;
use App\Models\Invoice;
use App\Models\Payment;
use App\Support\CodeGenerator;

class CompanyDemoSeeder extends Seeder
{
    public function run(): void
    {
        DB::transaction(function () {
            for ($c = 1; $c <= 2; $c++) {
                $company = Company::create([
                    'nom_company' => 'Company Demo '.$c,
                    'adresse' => 'Addr '.$c,
                    'email' => 'company'.$c.'@demo.tld',
                    'contact' => '+24399900000'.$c,
                    'secteur_activite' => 'Sante',
                    'type_etablissement' => 'Prive',
                    'description' => 'Demo company'
                ]);
                $company->refresh();
                if (is_null($company->code)) {
                    $seq = DB::table('company_code_sequence')->lockForUpdate()->first();
                    $next = $seq?->next_code ?? 100;
                    DB::table('company_code_sequence')->update(['next_code' => $next + 1]);
                    $company->update(['code' => $next]);
                }

                // Roles
                $adminRole = Role::create([
                    'company_id' => $company->id,
                    'code' => CodeGenerator::generate('roles', $company->id, 'ROLE'),
                    'nom_role' => 'ADMIN',
                ]);
                $managerRole = Role::create([
                    'company_id' => $company->id,
                    'code' => CodeGenerator::generate('roles', $company->id, 'ROLE'),
                    'nom_role' => 'MANAGER',
                ]);
                $techRole = Role::create([
                    'company_id' => $company->id,
                    'code' => CodeGenerator::generate('roles', $company->id, 'ROLE'),
                    'nom_role' => 'TECH',
                ]);

                // Donner toutes permissions à ADMIN
                $permIds = Permission::pluck('id')->all();
                foreach ($permIds as $pid) {
                    DB::table('role_permissions')->insert([
                        'company_id' => $company->id,
                        'code' => CodeGenerator::generate('role_permissions', $company->id, 'RP'),
                        'role_id' => $adminRole->id,
                        'permission_id' => $pid,
                    ]);
                }

                // Users: admin + 2 (manager, tech)
                $users = [];
                $users[] = User::create([
                    'company_id' => $company->id,
                    'code' => CodeGenerator::generate('users', $company->id, 'USR'),
                    'username' => 'admin'.$c,
                    'password' => Hash::make('Admin@1234'),
                    'email' => 'admin'.$c.'@demo.tld',
                    'is_active' => true,
                    'must_change_password' => true,
                ]);
                $users[] = User::create([
                    'company_id' => $company->id,
                    'code' => CodeGenerator::generate('users', $company->id, 'USR'),
                    'username' => 'manager'.$c,
                    'password' => Hash::make('Manager@1234'),
                    'email' => 'manager'.$c.'@demo.tld',
                    'is_active' => true,
                    'must_change_password' => true,
                ]);
                $users[] = User::create([
                    'company_id' => $company->id,
                    'code' => CodeGenerator::generate('users', $company->id, 'USR'),
                    'username' => 'tech'.$c,
                    'password' => Hash::make('Tech@1234'),
                    'email' => 'tech'.$c.'@demo.tld',
                    'is_active' => true,
                    'must_change_password' => true,
                ]);

                // assign roles
                DB::table('user_roles')->insert([
                    'company_id' => $company->id,
                    'code' => CodeGenerator::generate('user_roles', $company->id, 'UR'),
                    'user_id' => $users[0]->id,
                    'role_id' => $adminRole->id,
                ]);
                DB::table('user_roles')->insert([
                    'company_id' => $company->id,
                    'code' => CodeGenerator::generate('user_roles', $company->id, 'UR'),
                    'user_id' => $users[1]->id,
                    'role_id' => $managerRole->id,
                ]);
                DB::table('user_roles')->insert([
                    'company_id' => $company->id,
                    'code' => CodeGenerator::generate('user_roles', $company->id, 'UR'),
                    'user_id' => $users[2]->id,
                    'role_id' => $techRole->id,
                ]);

                // Categories & Articles
                $cat = CategoryArticle::create([
                    'company_id' => $company->id,
                    'code' => CodeGenerator::generate('categorie_articles', $company->id, 'CAT'),
                    'nom_categorie' => 'REACTIFS-'.$company->id,
                ]);
                $art1 = Article::create([
                    'company_id' => $company->id,
                    'code' => CodeGenerator::generate('articles', $company->id, 'ART'),
                    'categorie_id' => $cat->id,
                    'nom_article' => 'Tube EDTA 5ml',
                    'prix_unitaire' => 1.25,
                    'unite_mesure' => 'piece',
                ]);
                $art2 = Article::create([
                    'company_id' => $company->id,
                    'code' => CodeGenerator::generate('articles', $company->id, 'ART'),
                    'categorie_id' => $cat->id,
                    'nom_article' => 'Seringue 5ml',
                    'prix_unitaire' => 0.35,
                    'unite_mesure' => 'piece',
                ]);

                // Stocks
                $st1 = Stock::create([
                    'company_id' => $company->id,
                    'code' => CodeGenerator::generate('stocks', $company->id, 'STK'),
                    'article_id' => $art1->id,
                    'quantite_actuelle' => 100,
                    'seuil_critique' => 10,
                ]);
                $st2 = Stock::create([
                    'company_id' => $company->id,
                    'code' => CodeGenerator::generate('stocks', $company->id, 'STK'),
                    'article_id' => $art2->id,
                    'quantite_actuelle' => 50,
                    'seuil_critique' => 10,
                ]);

                // Movements (seed quelques entrées/sorties)
                StockMovement::create([
                    'company_id' => $company->id,
                    'code' => CodeGenerator::generate('mouvement_stocks', $company->id, 'MOV'),
                    'stock_id' => $st1->id,
                    'date_mouvement' => now()->subDays(2),
                    'quantite' => 20,
                    'type_mouvement' => 'Entrée',
                    'motif' => 'Appro demo'
                ]);

                // Patients & Doctors
                $ptype = PatientType::create([
                    'company_id' => $company->id,
                    'code' => CodeGenerator::generate('type_patients', $company->id, 'PT'),
                    'nom_type' => 'REGULIER-'.$company->id,
                ]);
                $docs = [];
                for ($d=1;$d<=4;$d++) {
                    $docs[] = Doctor::create([
                        'company_id' => $company->id,
                        'code' => CodeGenerator::generate('medecins', $company->id, 'DOC'),
                        'nom' => 'Doc'.$d.'C'.$company->id,
                        'prenom' => 'John',
                        'date_naissance' => '1980-01-01',
                        'sexe' => 'M',
                        'contact' => '+24390000000'.$d,
                        'numero_identification' => 'MD-'.rand(1000,9999)
                    ]);
                }
                $patients = [];
                for ($p=1;$p<=5;$p++) {
                    $patients[] = Patient::create([
                        'company_id' => $company->id,
                        'code' => CodeGenerator::generate('patients', $company->id, 'PAT'),
                        'nom' => 'Patient'.$p.'C'.$company->id,
                        'postnom' => 'X',
                        'prenom' => 'Y',
                        'email' => null,
                        'date_naissance' => '1990-01-01',
                        'sexe' => 'M',
                        'adresse' => 'Addr',
                        'contact' => '+2439100000'.$p,
                        'type_patient_id' => $ptype->id,
                        'medecin_resident_id' => $docs[0]->id,
                    ]);
                }

                // Examens
                $ex1 = Exam::create([
                    'company_id' => $company->id,
                    'code' => CodeGenerator::generate('examens', $company->id, 'EXM'),
                    'nom_examen' => 'Hemoglobine',
                    'description' => '',
                    'prix' => 12.5,
                    'delai_rendu_estime' => 24,
                    'unites_mesure' => 'g/dL',
                    'valeurs_reference' => '',
                    'type_echantillon' => 'Sang',
                    'conditions_pre_analytiques' => '',
                ]);
                // lier articles consommés
                DB::table('examen_articles')->insert([
                    'company_id' => $company->id,
                    'examen_id' => $ex1->id,
                    'article_id' => $art1->id,
                    'quantite_utilisee' => 1,
                    'created_at' => now(), 'updated_at' => now()
                ]);

                // Demandes + détails + facture + paiement
                $req = ExamRequest::create([
                    'company_id' => $company->id,
                    'code' => CodeGenerator::generate('demande_examens', $company->id, 'REQ'),
                    'patient_id' => $patients[0]->id,
                    'medecin_prescripteur_id' => $docs[0]->id,
                    'date_demande' => now()->subDay(),
                    'statut_demande' => 'Terminée',
                ]);
                DB::table('demande_examen_details')->insert([
                    'company_id' => $company->id,
                    'code' => CodeGenerator::generate('demande_examen_details', $company->id, 'RQD'),
                    'demande_id' => $req->id,
                    'examen_id' => $ex1->id,
                    'resultat' => '13.0',
                    'date_resultat' => now(),
                    'created_at' => now(), 'updated_at' => now()
                ]);
                $inv = Invoice::create([
                    'company_id' => $company->id,
                    'code' => CodeGenerator::generate('factures', $company->id, 'INV'),
                    'demande_id' => $req->id,
                    'patient_id' => $patients[0]->id,
                    'date_facture' => now(),
                    'montant_total' => 12.5,
                    'statut_facture' => 'En attente de paiement'
                ]);
                DB::table('facture_details')->insert([
                    'company_id' => $company->id,
                    'code' => CodeGenerator::generate('facture_details', $company->id, 'FD'),
                    'facture_id' => $inv->id,
                    'examen_id' => $ex1->id,
                    'prix_unitaire_facture' => 12.5,
                    'created_at' => now(), 'updated_at' => now()
                ]);
                Payment::create([
                    'company_id' => $company->id,
                    'code' => CodeGenerator::generate('paiements', $company->id, 'PAY'),
                    'facture_id' => $inv->id,
                    'date_paiement' => now(),
                    'montant_paye' => 12.5,
                    'methode_paiement' => 'Caisse'
                ]);
            }
        });
    }
}


