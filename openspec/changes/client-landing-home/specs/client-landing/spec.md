## ADDED Requirements

### Requirement: Public landing documents modules and release

The client SHALL render a public `/` with app name, live release version, per-module enabled/disabled badges, and a release section, degrading to a static offline fallback (never blank) when the backend is unreachable.

#### Scenario: Anonymous visit, backend up
- **WHEN** anyone opens `/`
- **THEN** version matches `GET /meta` AND every module key has a badge matching its flag.

#### Scenario: Backend down
- **WHEN** `/meta` is unreachable
- **THEN** the landing renders the static fallback with an offline badge.

### Requirement: Authenticated home lives at /~

The client SHALL serve the session overview at `/~` for logged-in users, redirect logged-in `/` to `/~`, and redirect anonymous `/~` (and `Protected` misses) to `/`.

#### Scenario: Session routing
- **WHEN** logged in and opening `/`
- **THEN** the app lands on `/~`; opening `/~` anonymous shows `/` instead.
