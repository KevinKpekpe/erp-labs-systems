<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\Company;
use App\Models\CategoryArticle;
use App\Models\Article;
use App\Models\Stock;
use App\Support\CodeGenerator;

class StockSeeder extends Seeder
{
    public function run(): void
    {
        $names = [
            'Tube EDTA 5ml','Tube citrate','Gants nitrile','Masque chirurgical','Seringue 5ml',
            'Seringue 10ml','Aiguille 21G','Coton hydrophile','Pipette Pasteur','Lame microscope',
            'Pointe micro-pipette','Flacon plastique'
        ];
        foreach (Company::all() as $company) {
            $cat = CategoryArticle::create([
                'company_id' => $company->id,
                'code' => CodeGenerator::generate('categorie_articles', $company->id, 'CAT'),
                'nom_categorie' => 'CONSOMMABLES-'.$company->id,
            ]);
            $criticalCount = 0;
            foreach ($names as $i => $n) {
                $article = Article::create([
                    'company_id' => $company->id,
                    'code' => CodeGenerator::generate('articles', $company->id, 'ART'),
                    'categorie_id' => $cat->id,
                    'nom_article' => $n,
                    'prix_unitaire' => rand(1, 50) / 2,
                    'unite_mesure' => 'piece',
                ]);
                $seuil = rand(5, 15);
                $qty = rand(0, 120);
                if ($criticalCount < 5) {
                    $qty = rand(0, $seuil); // forcer seuil critique pour 5 articles
                    $criticalCount++;
                }
                Stock::create([
                    'company_id' => $company->id,
                    'code' => CodeGenerator::generate('stocks', $company->id, 'STK'),
                    'article_id' => $article->id,
                    'quantite_actuelle' => $qty,
                    'seuil_critique' => $seuil,
                ]);
            }
        }
    }
}


