#!/bin/sh
set -eu
if [ -z "${APP_KEY:-}" ]; then
    echo "APP_KEY is required. Follow docs/DEPLOYMENT.md." >&2
    exit 1
fi
mkdir -p storage/framework/cache/data storage/framework/sessions storage/framework/views storage/logs
chown -R www-data:www-data storage bootstrap/cache
if [ "${APP_ENV:-production}" != "testing" ]; then
    php artisan config:cache
    php artisan route:cache
    php artisan view:cache
fi
exec "$@"

