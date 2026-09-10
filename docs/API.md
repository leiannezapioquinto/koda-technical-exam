# API reference

Base URL: the Laravel origin (for Docker, `http://localhost:8080`). Routes are intentionally unprefixed to match the requested contract.

## Session authentication

Send `Accept: application/json` on API calls. Use a cookie jar or browser session.

1. `GET /auth/csrf` returns `{"token":"..."}` and creates a session.
2. Send that token as `X-CSRF-TOKEN`, with cookies, on POST/PUT/DELETE.
3. After login or registration, fetch `/auth/csrf` again.

| Method | Route | Body/result |
| --- | --- | --- |
| POST | /auth/register | name, email, password, password_confirmation → 201, user |
| POST | /auth/login | email, password → 200, user |
| GET | /auth/user | 200, current user; otherwise 401 |
| POST | /auth/logout | 204 |

Registration password: at least 12 characters with letters and numbers; maximum 255 characters. Name/email maximum: 255. Login and registration are throttled to five attempts per minute per IP.

## Projects

All endpoints require an authenticated session.

| Method | Route | Result |
| --- | --- | --- |
| GET | /projects | 200, paginated projects |
| GET | /projects/:id | 200, one project |
| POST | /projects | 201, created project |
| PUT | /projects/:id | 200, updated project |
| DELETE | /projects/:id | 204, empty body |
| GET | /dashboard/summary | total, in_progress, completed, on_hold |

POST and PUT accept:

```json
{
  "client_name": "Acme Studio",
  "project_name": "Brand identity refresh",
  "description": "A cohesive visual identity across print and digital.",
  "status": "Planning",
  "priority": "Medium",
  "start_date": "2026-09-10",
  "due_date": "2026-10-10"
}
```

PUT is a full update: send all required fields. Omitted description on PUT is left unchanged; null clears it.

- Client and project names: required, nonblank strings, max 255.
- Description: nullable string, max 5,000.
- Status: Planning, In Progress, On Hold, Completed.
- Priority: Low, Medium, High.
- Both dates: required, YYYY-MM-DD.
- Due date must be on or after the start date.
- ID, owner, and timestamps cannot be set through the API.

Individual responses use `{"data": {...project}}`. List responses use Laravel's resource pagination: `data`, `links`, and `meta`, including `current_page`, `last_page`, `per_page`, `total`, `from`, and `to`.

## Query parameters

| Parameter | Values/default |
| --- | --- |
| search | Optional string, max 255; names and description |
| status | One of the valid statuses |
| priority | One of the valid priorities |
| sort | created_at (default), client_name, project_name, status, priority, start_date, due_date |
| direction | asc or desc (default) |
| page | Integer 1–1,000,000, default 1 |

Each page contains at most 25 projects, regardless of caller-supplied page-size parameters.

Example: `GET /projects?search=brand&status=In%20Progress&priority=High&sort=due_date&direction=asc&page=1`

## Errors

| HTTP status | Meaning |
| --- | --- |
| 401 | Authentication required |
| 404 | Project missing, invalid ID, or owned by another user |
| 419 | Session/CSRF token expired or missing |
| 422 | Field or query validation failed |
| 429 | Too many authentication attempts |

Validation response:

```json
{
  "message": "The due date cannot be earlier than the start date.",
  "errors": {
    "due_date": ["The due date cannot be earlier than the start date."]
  }
}
```

