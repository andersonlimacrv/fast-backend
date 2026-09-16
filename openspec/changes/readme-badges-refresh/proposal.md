## Why

README badges are stale (`tests-98-passing`, violating the oss-professional decision for a generic badge), stack badges are missing, test tiers aren't separated, the Structure tree omits `admin/`, `/meta`, migrations 0006–0008 and new scripts, and CHANGELOG has no prominent pointer. First real `docs-writer` delegation per `agent-flow`.

## What Changes

- Badge block grouped: status (CI, Release, License, Python) · backend stack with logos (FastAPI, PostgreSQL, Redis, SQLAlchemy, Docker) · frontend stack with logos (TypeScript, React, Vite, Tailwind) · test tiers label-only, no counts (`backend-unit`, `backend-integration`, `client-vitest`, `browser-e2e`).
- `docs-writer` (via `Task`) owns the body + `.pt-BR.md` mirror; I verify slugs/URLs with HEAD requests and enforce conventions.
- Structure tree synced; explicit CHANGELOG pointer section.

## Capabilities

### New Capabilities

- Nenhuma.

### Modified Capabilities

- `oss-presence`: vitrine badges + structure + changelog pointer current.

## Impact

- Só `README.md` + `.pt-BR.md` + change. Nenhum runtime, nenhuma URL nova além de shields.io.

## Non-goals (v2 §21)

Per-dependency version badges (RULES §10, ages); test counts in badges; new sections beyond pointer/structure.

## Acceptance criteria

1. Every badge URL returns 200 (HEAD check script, ephemeral).
2. Logo slugs only where simple-icons exists; tiers label-only.
3. Structure matches `app/`, `scripts/`, `openspec/specs/` counts on disk.
4. `.pt-BR.md` mirrors EN.
