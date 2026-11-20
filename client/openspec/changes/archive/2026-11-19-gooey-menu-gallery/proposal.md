# gooey-menu-gallery — proposal

## Why

Owner (2026-10-09): the GooeyMenu (the mislabeled `Tooltip.md` reference —
`review-design.md` §6) goes **straight into the Gallery** as its own item. The
gooey effect is kept for future use; the trigger's "N" artwork is replaced by
the house `Info` icon.

## What Changes

- **Catalog**: new item **26 GooeyMenu** (`kind: "feedback"`, `status:
  "validated"`, source `custom-ui/components/gooey-menu.tsx`, usage = Health
  debug overlay). Item 22 (Tooltip) drops the gooey reference from `source`/
  `usedIn` — the Health usage belongs to 26.
- **Component**: trigger glyph `GooGlyph` → `Info` (house icon, `size-5`);
  the SVG goo filter stays untouched.
- **Icons**: `GooGlyph` removed from `lib/icons.tsx` (dead after the swap;
  icons-audit hygiene) + `icons.test.tsx` adjusted.
- **Gallery proof**: `"gooey-menu"` in `catalog-demos` with the Health-style
  rows (Client / API / Ready / Errors) + caption; hover/keyboard test.
- **Docs**: `review-design.md` §6 + ledger row 26; CHANGELOG.

## Non-goals

Changing the goo filter or the open/close springs; using the menu anywhere
beyond the debug overlay; renumbering anything.

## Acceptance criteria

1. Gallery card 26 renders the live GooeyMenu (Info trigger, goo effect).
2. `GooGlyph` is gone from `lib/icons` (no dead artwork); tests green.
3. Gates: `tsc -b`, `oxlint`, vitest, `vite build` verdes.
