<?php

return [
    // 'all' => tout enregistrer en DB, 'errors' => seulement erreurs (>=400),
    // 'write' => seulement méthodes d'écriture (POST/PUT/DELETE/PATCH), 'none' => désactivé
    'requests' => env('AUDIT_REQUESTS', 'errors'),

    // Taille max du body enregistré (JSON) pour éviter d'enfler la DB
    'truncate_body_chars' => (int) env('AUDIT_TRUNCATE_BODY', 1000),

    // Politique de rétention (commande artisan fournie pour purger)
    'prune_days' => (int) env('AUDIT_PRUNE_DAYS', 30),
];


