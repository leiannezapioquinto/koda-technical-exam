# Testing

## PHP tests

Use PostgreSQL, including in tests; SQLite cannot exercise ILIKE and the production database constraints.

Create a separate empty database named `projexia_test`, copy `.env.testing.example` to `.env.testing`, and set its connection credentials. Generate an application key for that environment:

```sh
php artisan key:generate --env=testing
php artisan test --compact
```

Tests use transactions and refresh the dedicated test schema. A safety check refuses any database name not ending in `_test`. Never point test credentials at an application database. Database environment variables supplied by CI or Compose override the example values.

To run a focused suite:

```sh
php artisan test --compact tests/Feature/ProjectApiTest.php
php artisan test --compact tests/Feature/AuthTest.php
php artisan test --compact tests/Unit/ProjectServiceTest.php
```

The tests cover authentication, validation, ownership isolation, CRUD, dashboard counts, combined filters, literal case-insensitive search, stable pagination, and sorting. Unit tests isolate the project service from persistence.

## React tests

Use Node 24.15+:

```sh
npm ci
npm test
npm run build
```

Vitest and Testing Library cover form validation, submission, server errors, notifications, filtering, and destructive-action handling. Dialog behavior uses a minimal jsdom adapter; real keyboard focus and mobile layout are checked in the browser suite.

## Browser tests

With the local server running at http://127.0.0.1:8000 (or set E2E_BASE_URL):

```sh
npx playwright install chromium
npm run test:e2e
```

Browser tests create a unique account, exercise project creation/edit/search/delete, and check desktop and mobile layouts. They leave the test account behind but delete their project. Run against a local or disposable deployment, not production. To use installed Chrome, set PLAYWRIGHT_CHANNEL=chrome. Screenshots and reports are ignored by Git.

## Container tests

```sh
docker compose --env-file .env.docker --profile test run --build --rm test
```

The test database is a distinct PostgreSQL service backed by temporary memory. Tests do not use or reset the app's database volume.

## CI

The GitHub Actions workflow runs PHP tests against PostgreSQL 18, React tests, and the production frontend build. It also validates the Docker production image build.
