# gallery-proof-gaps — proposal

## Why

Owner (2026-10-09): item 22 (Tooltip) is validated but its Gallery card shows
no live proof — the card falls back to the source path and the "used in" link
(`To /health`). Audit found the same gap on item 24 (Collapsible): both are
`validated` with no key in the `DEMOS` registry, the only two of the whole
catalog.

## What Changes

- **`catalog-demos.tsx`**: add `tooltip` and `collapsible` proofs.
  - Tooltip: `TooltipProvider openDelay={0}` + three `Button` triggers —
    default top, `side="right" align="center"` (app-shell rail style) and
    `side="bottom"`; pill + arrow in both themes (tokens).
  - Collapsible: the three reveals — `slide` (sidebar default, vendored
    transition), `depth` (alternative) and `mask` (Accordion base, house
    spring 150/22) — each with its own trigger + caption.
- **Tests** (`ui-catalog.test.tsx`): collapsible open/close both directions;
  tooltip registry proof reveals on hover; **new guard** — every `validated`
  catalog entry must ship a demo (`hasDemo`), so the Gallery can never fall
  back to a path again.
- **Docs**: `entries.ts` notes for both items + CHANGELOG.

## Non-goals

Changing the components themselves; adding proofs for pending items; touching
the Gallery/Lab rendering.

## Acceptance criteria

1. Gallery cards 22 and 24 render live proofs (no source-path fallback).
2. Guard test fails if a `validated` item loses its demo.
3. Gates: `tsc -b`, `oxlint`, vitest, `vite build` verdes.
