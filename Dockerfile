FROM node:24-bookworm-slim AS frontend
WORKDIR /build
COPY package.json package-lock.json .npmrc ./
RUN npm ci
COPY vite.config.js ./
COPY resources ./resources
COPY public ./public
RUN npm run build

FROM php:8.5-apache-bookworm AS php-base
RUN apt-get update && apt-get install -y --no-install-recommends libpq-dev libonig-dev libzip-dev unzip \
    && docker-php-ext-install pdo_pgsql mbstring zip \
    && a2enmod rewrite headers \
    && rm -rf /var/lib/apt/lists/*
COPY --from=composer:2 /usr/bin/composer /usr/local/bin/composer
COPY docker/apache.conf /etc/apache2/sites-available/000-default.conf
COPY docker/php.ini /usr/local/etc/php/conf.d/projexia.ini
WORKDIR /var/www/html

FROM php-base AS dependencies
ENV COMPOSER_ALLOW_SUPERUSER=1
COPY composer.json composer.lock ./
RUN composer install --no-dev --prefer-dist --no-scripts --no-autoloader --no-interaction
COPY . .
RUN composer dump-autoload --no-dev --optimize --no-interaction

FROM php-base AS app
COPY --from=dependencies /var/www/html /var/www/html
COPY --from=frontend /build/public/build ./public/build
COPY docker/entrypoint.sh /usr/local/bin/projexia-entrypoint
RUN sed -i 's/\r$//' /usr/local/bin/projexia-entrypoint \
    && chmod +x /usr/local/bin/projexia-entrypoint \
    && chown -R www-data:www-data storage bootstrap/cache
EXPOSE 80
ENTRYPOINT ["projexia-entrypoint"]
CMD ["apache2-foreground"]

FROM app AS test
ENV COMPOSER_ALLOW_SUPERUSER=1
RUN composer install --prefer-dist --no-interaction
CMD ["php", "artisan", "test", "--compact"]

