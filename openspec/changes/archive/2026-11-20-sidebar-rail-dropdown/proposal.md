# sidebar-rail-dropdown — proposal

## Why

`client/e2e/sidebar.spec.ts:64` ("768px: rail icons, tooltip on hover,
dropdown anchors right") fails deterministically in CI: after opening the
footer account menu in rail mode, `menuBox.x >= trigBox.x + trigBox.width - 1`
is false. The same failure exists on `main` (run 38497959950, merge #14),
so it blocks every PR including #15 — it is not caused by the login work.

## What Changes

- Diagnose the real cause by reproducing locally (API + `sidebar.spec.ts:64`
  only): likely candidates are (a) the menu still being mid-animation when
  `boundingBox()` is read, (b) Floating-UI collision/flip picking `left`,
  or (c) the unset `--radix-dropdown-menu-trigger-width` var (Base-UI
  primitive, Radix var name) changing the width/fit calculation.
- Fix in `client/` (component, test timing, or both) — never loosen the
  assertion blindly; the "anchors right" behavior is the spec.
- Keep the change to sidebar/dropdown + e2e; no backend touch.

## Capabilities

- `design-system-link`: rail dropdown anchoring holds at 768px.

## Impact

- `client/src/components/app-sidebar.tsx` and/or
  `client/src/components/custom-ui/components/dropdown-menu/*`,
  `client/e2e/sidebar.spec.ts`, maybe a snapshot. No backend, no config.

## Non-goals

- Redesigning the sidebar or the dropdown choreography.
- Fixing `landing.png`-without-API (environmental, documented).

## Acceptance criteria

1. `sidebar.spec.ts` (full file, all viewports) passes locally against a
   running API and in CI (`web-e2e` green on the PR).
2. `npm run lint`, `tsc -b`, `npm test` stay green.
3. No change to the asserted behavior — menu still opens to the right of
   the rail trigger.
