## Context

GitHub markdown has no responsive layout primitives; the idiom is `<p align="center">` with images on one line — they wrap like text. Previous change (`readme-badges-tagline-howto`) left each badge on its own source line, which renders as a left-aligned vertical stack. Brand truth: lime bolt mark (`client/public/fast-backend-logo_NO_BG.webp`, transparent, 10 828 B) + banner (`docs/assets/fast-backend.webp`, 28 004 B) provided by the owner 2026-09-16. `favicon.svg` is a purple Vite-bolt recolor (off-brand); `icons.svg` sprite has zero `src` references (verified `2026-09-16`); `.png` logo has a baked black background despite the `NO_BG` name and costs 147 696 B.

## Goals / Non-Goals

**Goals:** branded centered header, self-wrapping badges, mobile-safe facts, on-brand favicon, delete dead assets.
**Non-Goals:** `.ico` fallback, theme-aware banners, asset pipeline changes.

## Decisions

1. **Banner via relative path `docs/assets/fast-backend.webp`** — renders on GitHub from repo root for both READMEs; `width="640"` caps desktop while small screens scale down natively (`img` max-width behavior on GitHub).
2. **H1 removed, `alt` carries the title** — keeps a11y/SEO text (`FastBACKEND — FastAPI + Backend Boilerplate`); index anchors unaffected (no section linked to `#fast-backend`).
3. **One `<p align="center">` per badge group** — short groups (status) and wide groups (tiers) center independently, fixing the ragged-width complaint without fixed sizes.
4. **Vertical `Fact|Value` table** — each fact on its own row: short cells, no mobile overflow; test counts split backend/frontend across two rows.
5. **Deletion set is provably safe** — `favicon.svg` referenced only by `client/index.html:5` (swapped in the same change); `icons.svg` unreferenced; `.png` superseded by `.webp` (same mark, transparent, 13× smaller).

## Risks / Trade-offs

- [Old browsers without webp favicon → negligible 2026; `.ico` fallback deferred as non-goal] — accepted by owner.
- [Banner path is GitHub-relative; offline mirrors of README won't resolve it] — same tradeoff as any repo-local image; accepted.

## Migration Plan

Docs + static assets only. Rollback = revert commit (deletions restored).

## Open Questions

- Nenhuma bloqueante (banner file confirmed at `docs/assets/fast-backend.webp` before execution).
