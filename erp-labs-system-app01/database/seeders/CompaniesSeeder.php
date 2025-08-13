<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\Company;

class CompaniesSeeder extends Seeder
{
    public function run(): void
    {
        DB::transaction(function () {
            foreach ([1,2] as $i) {
                $company = Company::create([
                    'nom_company' => 'Clinique Demo '.$i,
                    'adresse' => 'Av. Kasa-Vubu, Kinshasa',
                    'email' => 'contact'.$i.'@demo.tld',
                    'contact' => '+24389000000'.$i,
                    'secteur_activite' => 'Sante',
                    'type_etablissement' => 'Prive',
                    'description' => 'Laboratoire démo'
                ]);
                $company->refresh();
                if (is_null($company->code)) {
                    $seq = DB::table('company_code_sequence')->lockForUpdate()->first();
                    $next = $seq?->next_code ?? 100;
                    DB::table('company_code_sequence')->update(['next_code' => $next + 1]);
                    $company->update(['code' => $next]);
                }
            }
        });
    }
}


