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

Useful flows to eyeball: `/` landing (anonymous, backend on/off) → register/login → `/~` session overview →
`/orgs` create + switch tenant → `/projects` CRUD → `/grants` + `/audit` (admin).

## Landing (`/`, public)

Documents modules, flags and release from live `GET /meta` (static fallback + offline badge when the backend is down — never blank, no secrets/hosts/PII rendered). Logged-in `/` redirects to `/~`; anonymous `/~` (and every `Protected` miss) redirects to `/`. No trackers, no third-party requests.

## Admin dashboard (`/admin*`, staff+)

Needs a privileged user (backend change `A-admin-control-plane`):

```bash
# repo root — one-shot root (BOOTSTRAP_KEY read from .env, valid email,
# password twice via prompt, min 8 chars):
make admin-bootstrap email=you@example.com
```

Then log in as root: nav shows **Admin / Admin users / Admin orgs / Admin audit**.
Every mutation asks for a `reason` (audited, min 8 chars — validated inline);
disable / revoke-sessions / force-reset / staff grant-revoke ask for confirmation.
Force-reset only queues the email (`{status:accepted}`) — no secret ever hits the screen.
As a plain member the nav hides and deep links render the backend 403. Admin pages
need no active org (global scope); `/admin/audit` is root-only.

## Login (two-step, email-first)

The landing **Login** button opens a modal; `/login` is the same form as a page.
Step 1 validates format and **always advances** for valid emails — existence is never
revealed (backend answers generic 401 with equal Argon2 cost either way). Errors stay
inline; success lands on `/~`.

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
├── components/ # ui/ is shadcn (don't hand-edit primitives); hand-owned ui/ catalog
│                # (tabs, tooltip, alert-dialog, checkbox, radio, accordion, avatar,
│                #  copy-button, switch) adapted from /references + motion micro-interactions
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
npm run e2e      # playwright (axe + snapshots, Chromium) vs preview build
```

Browser E2E (`make web-e2e`): anonymous routes always run; member routes need the
API up (`make db-up && make migrate && make api`) or they skip. The API must allow
the SPA origin (`CORS_ORIGINS` including `http://localhost:5173`) or every fetch
fails closed and backend-driven assertions fail. `@axe-core/react`
also audits the console in `vite dev`. Snapshot baselines are per-platform:
`linux/` is committed (seeded by `web-e2e-baselines.yml`), local `win32/` never is.
