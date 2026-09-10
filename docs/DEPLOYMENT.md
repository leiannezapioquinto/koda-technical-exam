# Docker deployment

## Stack

- PHP 8.5 + Apache, with the production React bundle.
- PostgreSQL 18, backed by the `postgres-data` named volume.
- A one-shot migration service; the app starts only after it succeeds.
- Health checks for database and app.
- A separate optional test service and ephemeral test database.

Docker publishes only the web port. PostgreSQL is reachable only inside the Compose network.

## First run

Start Docker Desktop in Linux-container mode, or Docker Engine with Compose v2.

Windows PowerShell:

```powershell
./docker/setup.ps1
docker compose --env-file .env.docker up --build -d
```

The setup script creates random secrets and preserves an existing `.env.docker`.

Linux/macOS (requires openssl):

```sh
cp .env.docker.example .env.docker
openssl rand -base64 32
openssl rand -base64 32
```

Put `base64:` followed by the first generated value in APP_KEY, and the second value in DB_PASSWORD. Do not commit `.env.docker`. Then run:

```sh
docker compose --env-file .env.docker up --build -d
docker compose --env-file .env.docker ps
```

Open http://localhost:8080 and register. To change the port, edit APP_PORT and APP_URL in `.env.docker`.

To seed demo data (login `demo@projexia.test` / `ProjexiaDemo2026!` with sample projects) on the first run, set `SEED_DEMO_DATA=true` in `.env.docker` before starting the stack. It is safe to leave on across restarts — seeding is idempotent — but keep it `false` for real deployments.

## Public HTTPS deployment

Point a reverse proxy with TLS at the app port, set APP_URL to the public HTTPS origin, and set SESSION_SECURE_COOKIE=true. Keep APP_ENV=production and APP_DEBUG=false. Restrict direct access to the backend port with your host firewall.

Do not enable local demo seeding in production. Sessions and data persist in PostgreSQL; logs go to container stdout/stderr. Keep APP_KEY stable across restarts and updates.

## Updates

Back up the database before applying schema changes:

```sh
docker compose --env-file .env.docker build app migrate
docker compose --env-file .env.docker run --rm migrate
docker compose --env-file .env.docker up -d --force-recreate app
```

If migration fails, inspect its output and fix the cause before restarting the app. Destructive schema changes require a separate migration plan.

## Backups

Generate a custom-format backup inside the database container, then copy it to the host:

```sh
docker compose --env-file .env.docker exec database sh -c 'pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" -Fc -f /tmp/projexia.dump'
docker compose --env-file .env.docker cp database:/tmp/projexia.dump ./projexia.dump
```

Store backups securely and test restoration into a separate empty database. The dump contains user and project data. Do not commit backups.

## Operations

```sh
docker compose --env-file .env.docker logs --tail=100 app migrate
docker compose --env-file .env.docker stop
docker compose --env-file .env.docker start
```

`docker compose down` preserves named volumes. Adding `-v` deletes the database volume and all its data.

## Tests in containers

```sh
docker compose --env-file .env.docker --profile test run --build --rm test
```

The test service uses a separate database on tmpfs and cannot connect to the application database through its configured connection. PHP tests additionally refuse to refresh any database whose name does not end in `_test`.

## Deployment boundary

These files provide a self-hosted Docker deployment. No cloud account, domain, or remote server is configured. A public URL requires running the stack on your server and adding HTTPS.

