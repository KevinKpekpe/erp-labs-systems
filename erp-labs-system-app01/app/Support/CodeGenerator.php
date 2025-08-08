<?php

namespace App\Support;

use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class CodeGenerator
{
    /**
     * Génère un code unique lisible pour une table donnée.
     * Les codes sont de la forme PREFIX-YYYYMMDD-<companyId?>-XXXXXX
     */
    public static function generate(string $table, ?int $companyId = null, ?string $prefix = null): string
    {
        $prefixMap = [
            'roles' => 'ROLE',
            'users' => 'USR',
            'user_roles' => 'UR',
            'role_permissions' => 'RP',
            'categorie_articles' => 'CAT',
            'articles' => 'ART',
            'stocks' => 'STK',
            'examens' => 'EXM',
            'examen_articles' => 'EXA',
            'demande_examens' => 'DEX',
            'demande_examen_details' => 'DED',
            'mouvement_stocks' => 'MSK',
            'alerte_stocks' => 'ALT',
            'factures' => 'INV',
            'facture_details' => 'IND',
            'paiements' => 'PAY',
            'employes' => 'EMP',
            'horaire_employes' => 'HRE',
            'presence_employes' => 'PRE',
        ];

        $pfx = $prefix ?: ($prefixMap[$table] ?? Str::upper(Str::substr($table, 0, 3)));
        // Format plus court: PFX-YYMM-XXXX (4 chars aléatoires)
        $ym = now()->format('ym');
        do {
            $rand = Str::upper(Str::random(4));
            $code = sprintf('%s-%s-%s', $pfx, $ym, $rand);
            $exists = DB::table($table)->where('code', $code)->exists();
        } while ($exists);

        return $code;
    }
}


