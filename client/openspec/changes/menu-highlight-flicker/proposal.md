# menu-highlight-flicker — proposal

## Why

Dropdown menus (org switcher, Projects `+`/row actions, user menu) blink on hover: the sliding pill ghosts — measured 12/12 samples with 2–4 simultaneous `[data-slot="motion-highlight"]` pills on the same item (owner, 2026-10-01). The sidebar nav never blinks: it uses one parent-mode pill, while menus paint one pill per item (`layoutId` handoff) with `AnimatePresence` exit delayed 200ms (upstream default) — the old pill stays fully opaque while the new one fades in.

## What Changes

- **`dropdown-menu/primitive.tsx`**: `DropdownMenuHighlight` defaults `exitDelay={0}` (overridable) — the old pill starts leaving immediately (crossfade instead of ghost).
- **`effects/highlight.tsx`**: when the effective exit delay is 0, the children-mode pill exits with `{duration: 0}` (local delta, documented in code) so the `layoutId` handoff pairs mount/unmount cleanly; everyone else keeps the fade. Measured after: single pill per frame, opacity sum 0→1 smooth.
- **Docs**: CHANGELOG entry. No catalog/proof changes (behavior-only fix).

## Non-goals

Changing the pill look, timing of enter, or any other consumer (tabs, toggle-group keep their fade).

## Acceptance criteria

1. Hovering menu items shows exactly one pill; no brightness spike (measured: 1 visible pill/frame, smooth 0→1 sum).
2. Gates: `tsc -b`, `oxlint`, vitest (catalog + sidebar), `vite build` green.
3. Owner visual ok on the org + Projects menus (both themes).
