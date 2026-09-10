# Local setup

## Requirements

- PHP 8.5 recommended; PHP 8.4 is supported for local development.
- Composer 2.
- Node 24.15+ (Node 24 LTS recommended) and npm.
- PostgreSQL 18.
- PHP extensions: PDO, pdo_pgsql, mbstring, XML/DOM, ctype, curl, fileinfo, openssl, tokenizer, zip.

The production container uses PHP 8.5. Dependency versions are recorded in `composer.lock` and `package-lock.json`. Laravel 13 requires PHP 8.3+, but this project's PHPUnit/dependency set requires PHP 8.4+.

## Install

```sh
composer install
npm ci
cp .env.example .env
php artisan key:generate
```

PowerShell users can replace `cp` with `Copy-Item`.

Create an empty PostgreSQL database and a dedicated database user. Configure these values in `.env`:

```dotenv
APP_NAME=Projexia
APP_URL=http://localhost:8000
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=projexia
DB_USERNAME=projexia
DB_PASSWORD=your-local-password
```

Then:

```sh
php artisan migrate
npm run build
php artisan serve --host=127.0.0.1 --port=8000
```

Open http://localhost:8000. Register a new account.

For hot reloading, run `npm run dev` in a second terminal. Open the Laravel URL, not Vite's asset-server URL. Stop Vite when returning to built assets; a stale `public/hot` file points Laravel at an unavailable development server.

## Optional demo

Only allowed when `APP_ENV=local` or `testing`:

```sh
php artisan db:seed --class=DemoSeeder
```

- Email: `demo@projexia.test`
- Password: `ProjexiaDemo2026!`

The seeder is repeatable and adds eight example projects. Default database seeding does not create an account or demo data. Do not enable this demo account on a public deployment.

## Troubleshooting

- Database connection errors: confirm PostgreSQL is running and the host, port, user, password, and database exist.
- Stale configuration: run `php artisan config:clear`.
- Missing Vite manifest: run `npm run build`.
- Native npm binding errors after an interrupted install: reinstall the affected package or run `npm ci` with a fresh npm cache.
- CSRF errors: reload the page. Browser writes require the session cookie and current CSRF token.
- Windows build process permissions: allow Node to spawn its build worker processes.

