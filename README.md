# Projexia

A responsive client project tracker for a digital agency, built with **Laravel 13**, **React 19 + Vite 8**, and **PostgreSQL 18**. Docker uses **PHP 8.5**.

![Projexia logo](public/logo.svg)

## Features

- Sign up, sign in, and sign out with secure server-side sessions.
- User-owned projects with create, view, edit, and delete endpoints.
- Accessible create/edit dialogs and a delete confirmation dialog.
- Search client names, project names, and descriptions.
- Combine status and priority filters; sort by names, dates, status, or priority.
- Server-side pagination fixed at 25 projects.
- Dashboard totals, desktop tables, and mobile project cards.
- PHP unit/API tests, React tests, and a Docker deployment.

## Start with Docker

Install and start Docker Desktop (Linux containers) or Docker Engine with Compose v2.

On Windows, generate local deployment secrets:

```powershell
./docker/setup.ps1
docker compose --env-file .env.docker up --build -d
```

Open **http://localhost:8080** and create an account. The application starts empty. Compose waits for PostgreSQL, applies migrations, and then starts the web app.

For Linux/macOS, environment setup, upgrades, backups, and HTTPS, see [Deployment](docs/DEPLOYMENT.md).

## Local development

See [Setup](docs/SETUP.md) for PHP/Node prerequisites, PostgreSQL setup, optional demo data, and development commands.

## Tests

Tests use a dedicated PostgreSQL database ending in `_test`; they never use the application database.

```sh
docker compose --env-file .env.docker --profile test run --build --rm test
npm ci
npm test
```

See [Testing](docs/TESTING.md) for local setup and browser checks.

## Documentation

- [Setup](docs/SETUP.md)
- [Architecture and design decisions](docs/ARCHITECTURE.md)
- [API reference](docs/API.md)
- [Docker deployment](docs/DEPLOYMENT.md)
- [Testing](docs/TESTING.md)

## AI tools disclosure

This project was built with the assistance of AI tools: **ChatGPT** and **Claude** (Claude Code).

