# icons-audit — proposal

## Why

Owner (2026-10-09): standardize icon usage — every icon in the app must come
from `lib/icons.tsx` (regra de ouro), with no repeated icon imports scattered
through `custom-ui`.

## What Changes

- **Audit**: grep all icon-library imports in `custom-ui` + cross-check every
  `@/lib/icons` import resolves to a named re-export + dead-export scan over
  all of `client/src` (139 files, 79 exports).
- **Cleanup**: drop the 11 dead lucide re-exports (`BadgeCheck`, `Bell`,
  `ChartColumn`, `ChevronsLeft`, `ChevronsRight`, `Clock`, `Database`,
  `Globe`, `Inbox`, `Send`, `Tag`) — unused anywhere in the client.
- **Untouched**: the two functional inline SVGs (`circular-progress` ring
  geometry, `gooey-menu` filter defs) are component rendering, not icons.

## Non-goals

Swapping icon libraries; renaming in-use icons; touching non-custom-ui code.

## Acceptance criteria

1. Zero direct `react-icons`/`lucide-react` imports outside `lib/icons.tsx`.
2. Zero dead exports in `lib/icons.tsx`.
3. Gates: `tsc -b`, full vitest, `vite build` verdes.
