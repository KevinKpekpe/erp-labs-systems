<?php

return [
    // Durée de vie des tokens Sanctum en minutes. 0 ou null = pas d'expiration.
    'ttl_minutes' => (int) env('TOKEN_TTL_MINUTES', 0),
];


