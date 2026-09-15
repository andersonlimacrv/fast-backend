# /client — backend visualization SPA (dev only)

Vite + React + TypeScript + Tailwind CSS v4 + shadcn (`new-york`) + tweakcn-compatible
theme tokens. Read-only visualization of the `fast-backend` HTTP contracts — no business
logic lives here; the backend in `app/` is consumed purely over HTTP.

## Prereqs

- Node >= 20, npm
- Backend running locally (see repo root `docker-compose.yml` + `.env`)

## Backend first (repo root)

```bash
cp .env.example .env
# add the Vite dev origin so the browser is allowed:
# CORS_ORIGINS=http://localhost:5173
docker compose up -d db redis
uv sync --extra dev
uv run alembic upgrade head
uv run uvicorn app.main:create_app --factory --port 8000 --reload
```

Health: `GET http://localhost:8000/healthz` → `{"status":"ok"}`.

## Run the SPA

```bash
cd client
cp .env.example .env   # VITE_API_URL=http://localhost:8000
npm install
npm run dev            # http://localhost:5173
```

Useful flows to eyeball: `/health` (no auth) → register/login → `/` overview →
`/orgs` create + switch tenant → `/projects` CRUD → `/grants` + `/audit` (admin).

## Admin dashboard (`/admin*`, staff+)

Needs a privileged user (backend change `A-admin-control-plane`):

```bash
# repo root — one-shot root (BOOTSTRAP_KEY from .env, password via prompt):
make admin-bootstrap
```

Then log in as root: nav shows **Admin / Admin users / Admin orgs / Admin audit**.
Every mutation asks for a `reason` (audited, min 8 chars — validated inline);
disable / revoke-sessions / force-reset / staff grant-revoke ask for confirmation.
Force-reset only queues the email (`{status:accepted}`) — no secret ever hits the screen.
As a plain member the nav hides and deep links render the backend 403. Admin pages
need no active org (global scope); `/admin/audit` is root-only.

## Notes

- Auth is `Bearer` access JWT (10–15 min) + opaque Postgres refresh with mandatory
  rotation: on 401 the client refreshes once and retries; refresh reuse revokes the
  family and the SPA forces logout (expected backend behavior).
- `active_org_id` in the JWT is display context only — authority is the Postgres
  membership, enforced server-side.
- Tokens live in `localStorage` for dev convenience. Never ship this to prod as-is.
- Theme: Tailwind v4 CSS-first (`src/index.css`, `@theme` oklch). Paste tweakcn output
  over the `:root`/`.dark` blocks to re-theme.

## Architecture

```
src/
├── lib/        # transport (api.ts: fetch + ApiError + wire types), constants, utils — no React, no DOM
├── services/   # domain without React (session, orgs, projects, members, grants, audit, health, account, admin)
├── hooks/      # React data layer (useAsync, useCollection, per-domain hooks, useAdmin*)
├── contexts/   # session state (AuthContext)
├── external/   # non-backend integrations (theme)
├── components/ # ui/ is shadcn (don't hand-edit); feedback, layout
└── pages/      # composition + form state only
```

Import rule: `pages → hooks → services → lib`. Pages never import `@/lib/api`
directly (use a hook); services never import React; `lib/api.ts` never touches
`window`/`localStorage` (session side-effects live in `services/session.ts`).

## Checks

```bash
npm run build    # tsc -b && vite build
npm run lint     # oxlint
npm run test:run # vitest (services + hooks)
```
