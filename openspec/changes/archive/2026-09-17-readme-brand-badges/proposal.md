## Why

README header is a bare `# fast-backend` H1 with left-aligned badge soup (one badge per line, ragged widths, wasted vertical space). The status table (4 columns, one mega-row) overflows on mobile. `client/public/` carries off-brand leftovers: `favicon.svg` (purple recolored Vite bolt — the SPA's actual favicon), unused `icons.svg` sprite, and a 147 KB black-background `.png` duplicating the 10.8 KB transparent `.webp` mark. The real brand banner (`docs/assets/fast-backend.webp`, provided 2026-09-16) is unused.

## What Changes

- README EN+PT: banner header (`docs/assets/fast-backend.webp`, centered, `width=640`, descriptive `alt`) replacing the H1; badge groups wrapped in `<p align="center">` (natural wrap = responsive); 4-col mega-table replaced by vertical `Fact|Value` table with short cells; doc bullets kept.
- `client/index.html:5`: favicon → `/fast-backend-logo_NO_BG.webp` (`type=image/webp`).
- Delete: `client/public/favicon.svg`, `client/public/icons.svg` (zero `src` usage), `client/public/fast-backend-logo_NO_BG.png` (black bg, 13× heavier than webp).
- Mirror every edit EN ↔ PT-BR. No runtime code.

## Capabilities

### New Capabilities

- Nenhuma.

### Modified Capabilities

- `oss-presence`: branded header + responsive badges + mobile-safe facts table.
- `client-landing`: favicon on-brand (same lime mark as banner).

## Impact

- `README.md`, `README.pt-BR.md`, `client/index.html`, 3 deletions, 1 pre-existing banner asset + this change. `client/src/assets/vite.svg|react.svg` untouched (Vite template leftovers, out of scope).

## Non-goals

- `.ico` fallback; banner variants (dark/light); touching `references/components_to_use/`.

## Acceptance criteria

1. Banner renders centered ≤640px on GitHub EN+PT with meaningful `alt`.
2. Badge groups wrap without clipping at 390/768/desktop widths.
3. Facts table has no horizontal scroll on mobile; all links 200.
4. `vite build` passes; no remaining reference to deleted files (`grep` clean); favicon served 200 from dev server.
5. `.pt-BR.md` mirrors EN.
