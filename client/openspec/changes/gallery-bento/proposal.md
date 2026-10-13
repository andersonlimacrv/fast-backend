# gallery-bento — proposal

## Why

Owner (2026-10-13): the Gallery is a uniform 1-column stack — make it
responsive, mosaic/bento style, with proofs using tile space better.
`ui-designer` proposal (from `docs/DESIGN.md` §§3/4/6/7/8, read-only).

## What Changes

- **`Gallery.tsx` only** (Lab/trials untouched, `catalog-demos.tsx`
  untouched, no slug/key/status change):
  - Each section becomes `@container`; cards in
    `grid grid-cols-1 gap-4 items-start grid-flow-dense @[44rem]:grid-cols-2 @[76rem]:grid-cols-3`;
    section stack `gap-4` → `gap-8`.
  - Span map (4 rules, by demo intrinsic width, not kind): default 1 col;
    8 wide slugs (`accordion`, `collapsible`, `credit-usage-card`,
    `expand-details`, `tabs`, `animated-circular-progress-bar`,
    `subsription-calendar`, `404-page-not-found`) span 2 only at ≥2-col
    containers; never span-3/row-span; tall-narrow tiles stay 1 col.
  - Demo wrapper: `min-w-0` universal (anti-blowout) + `grid
    justify-items-center` for capped roots (`credit-usage-card`, `tabs`,
    `inputs`, `sidebar`).
  - Header slim: title `text-base` → `text-sm`, drop `StatusBadge` (every
    card here is validated — uniform badge is noise, DESIGN §3.1),
    `UsageList` untouched; `CardHeader p-4 pb-2`, `CardContent p-4 pt-0`.
- **No new tokens**, no radius change, no entrance choreography (§3.3),
  DOM/keyboard/ARIA order preserved, `ring-2` + reduced-motion intact.

## Non-goals

Lab page; component redesigns; masonry/row-span/JS measuring; DESIGN.md
changes (everything fits existing §§); touching demos, slugs or statuses.

## Acceptance criteria

1. Gallery renders 1/2/3-col bento per container width; wide tiles span 2,
   no mid-grid holes, no horizontal blowout at any shell state.
2. Narrow capped demos center in wide tiles instead of hugging left.
3. Gates: `tsc -b`, `oxlint`, vitest (incl. `validated ⇒ hasDemo` guard +
   `app-sidebar`), `vite build` verdes; visual light/dark × drawer/rail/
   expanded com o dono.
