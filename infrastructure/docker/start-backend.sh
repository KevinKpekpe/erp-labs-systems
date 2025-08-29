#!/bin/bash
set -e

echo "🚀 Démarrage du Backend Laravel ERP Labs System..."

# Attendre que MySQL soit prêt
echo "⏳ Attente de la connexion MySQL..."
until php artisan tinker --execute="DB::connection()->getPdo();" > /dev/null 2>&1; do
    echo "⏳ MySQL n'est pas encore prêt, attente..."
    sleep 2
done
echo "✅ MySQL est prêt !"

# Générer la clé d'application si elle n'existe pas
if [ ! -f .env ]; then
    echo "📝 Création du fichier .env..."
    cp .env.example .env
fi

# Générer la clé d'application
if [ -z "$(grep '^APP_KEY=' .env | cut -d '=' -f2)" ] || [ "$(grep '^APP_KEY=' .env | cut -d '=' -f2)" = "" ]; then
    echo "🔑 Génération de la clé d'application..."
    php artisan key:generate
fi

# Exécuter les migrations si nécessaire
echo "🗄️ Vérification des migrations..."
php artisan migrate --force

# Optimiser l'application
echo "⚡ Optimisation de l'application..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Démarrer Supervisor (qui gère PHP-FPM, Nginx et les queues)
echo "🔄 Démarrage de Supervisor..."
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf
