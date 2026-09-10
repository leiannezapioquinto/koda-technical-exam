# Architecture

## Request flow

```text
React → Laravel route → Form Request → Controller → Service → Repository → Eloquent → PostgreSQL
```

Controllers translate HTTP requests and responses. Form Requests validate inputs. Services coordinate user-scoped operations. Repositories own persistence and query construction. Eloquent resources explicitly define the project response shape.

Concrete repositories are constructor-injected through Laravel's container. Interfaces are intentionally omitted for this single database implementation; unit tests replace repositories with mocks.

## Project layout

| Path | Responsibility |
| --- | --- |
| app/constants | Fixed domain values, limits, and pagination size |
| app/Http/Requests | Authentication, project, and query validation |
| app/Http/Controllers | HTTP entry points |
| app/Http/Resources | Project serialization |
| app/Services | Authentication and project operations |
| app/Repositories | User creation and project persistence/querying |
| app/Models | Users and projects |
| routes/public.php | Public pages and authentication |
| routes/frontend.php | Protected dashboard and summary |
| routes/projects.php | REST project endpoints |
| resources/js/components | React forms, dialogs, dashboard, and project list |
| resources/views/app.blade.php | React shell and shared domain configuration |
| docker | Apache, PHP, container entrypoint, and secret initialization |
| tests | PHP unit and PostgreSQL API tests |

## Data model

A project has an integer ID, owning user, client name, project name, optional description, status, priority, start date, due date, and timestamps. Both dates are required. Dates are calendar dates in `YYYY-MM-DD` format; the UI does not convert them through UTC.

PostgreSQL enforces ownership references, valid status/priority values, and due date >= start date. Indexes cover user/status, user/priority, and user/due date. Deleting a user cascades to their projects.

## Authentication and authorization

Authentication uses Laravel's session guard with database-backed sessions. Passwords are hashed; raw passwords and remember tokens are hidden from responses. Registration logs the user in. Successful authentication rotates the session ID. Logout invalidates the session and regenerates the CSRF token.

Registration and login are limited to five attempts per minute per IP. Passwords require 12 characters including letters and numbers. Emails are normalized to lowercase.

Every project query is scoped to the authenticated user, including search, counts, reads, updates, and deletes. Access to someone else's project returns 404. Requests cannot assign or change the owner.

All API routes use the web middleware stack because React and Laravel share an origin. Unsafe requests require CSRF protection; this is not a stateless bearer-token API.

## Listing behavior

- Fixed page size: 25; `per_page` is not honored.
- Search is case-insensitive PostgreSQL `ILIKE`, over client name, project name, and description.
- Search treats `%`, `_`, and backslashes literally.
- Filters combine with search using AND.
- Sorting uses a validated allowlist, with ID as a stable tie-breaker.
- Priority sorts by business order: Low, Medium, High.
- Status sorts alphabetically.
- Dashboard counts always cover all of the user's projects, independent of list filters.

For a small agency dataset, indexed user scoping plus substring search is sufficient. A larger dataset could add PostgreSQL trigram indexes after measuring query performance.

## Frontend

Vite bundles React into Laravel's public assets. PHP constants are serialized into an inert JSON script in the Blade shell, keeping statuses, priorities, and size limits aligned. UI-only styling is kept in the React/CSS layer.

Native HTML dialogs provide keyboard focus trapping, Escape handling, background inertness, and focus restoration. Forms preserve input and show field errors after failed saves. In-flight writes disable repeated submissions. List requests are cancelled when filters change, preventing stale responses from replacing current results.

Desktop uses a sortable table; mobile uses stacked cards. There is no externally hosted font dependency. The logo is a small editable SVG.

## Deliberate scope

Each account has its own workspace; shared teams, invitations, password reset email, email verification, attachments, and audit history are not included. No paid or third-party service is required to run the application.

