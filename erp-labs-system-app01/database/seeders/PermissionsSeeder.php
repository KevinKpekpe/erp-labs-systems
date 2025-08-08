<?php

namespace Database\Seeders;

use App\Models\Permission;
use Illuminate\Database\Seeder;

class PermissionsSeeder extends Seeder
{
    public function run(): void
    {
        $modules = [
            'COMPANY', 'USER', 'ROLE', 'PERMISSION',
            'PATIENT', 'MEDECIN', 'EXAMEN', 'DEMANDE_EXAMEN', 'DEMANDE_EXAMEN_DETAIL',
            'CATEGORIE_ARTICLE', 'ARTICLE', 'STOCK', 'MOUVEMENT_STOCK', 'ALERTE_STOCK',
            'FACTURE', 'FACTURE_DETAIL', 'PAIEMENT',
            'EMPLOYE', 'HORAIRE_EMPLOYE', 'PRESENCE_EMPLOYE',
        ];

        $actions = ['LIST', 'READ', 'CREATE', 'UPDATE', 'DELETE'];

        foreach ($modules as $module) {
            foreach ($actions as $action) {
                $code = $action . '_' . $module;
                Permission::updateOrCreate(
                    ['code' => $code],
                    [
                        'action' => $action,
                        'module' => $module,
                    ]
                );
            }
        }
    }
}


