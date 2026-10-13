# notify-standard — proposal

## Why

Owner (2026-10-13): reformulate the notification system. Split the two
channels — in-page blocks (page errors and filler states) vs push
notifications (transient, global) — prioritizing push, with the `gooey-toast`
swap (`gooey-toast@0.2.2`, vetted from npm metadata + README) as a later
phase. Audit (read-only, 2026-10-13) found: house Base-UI push already works
(`services/notify.ts` + `AppToaster`), in-page blocks coherent (`ErrorBox` /
`EmptyState` / `ErrorOne` / `AlertDialog`), but `notify.confirm` carries two
semantics, the push-vs-block rule is unwritten, `ErrorBox` has no retry slot,
and the future-lib seam leaks the provider.

## What Changes

- **S1 blocks**: `ErrorBox` gains `actionLabel`/`onAction` (retry slot,
  mirroring `EmptyState`); `notify.confirm` migrated (admin/Users → blocking
  `AlertDialog`; orgs/Orgs created-notice → `success`) and retired; rule
  push-vs-block recorded in `CLIENT-STRUCTURE.md` + `code-reviewer`
  checklist; page-specific blocks live in `pages/{page}/blocks/` (inventory:
  zero moves needed — all blocks today are shared imports); `friendlyError`
  imported from `services/notify` (drop the `feedback.tsx` re-export if
  unused).
- **S2 seam**: `services/notify.ts` exports ONLY the contract (`notify`,
  `friendlyError`, `NotifyInput`, `ToastKind`, `ConfirmAction` retired with
  confirm); Base-UI manager/provider wiring moves to
  `services/notify.provider.ts`; `toaster.tsx` + tests consume the provider.
  Zero visual/behavior change.
- **S3 swap (after owner ok on the swap design)**: install pinned
  `gooey-toast@0.2.2`; vetting checklist (tsc/oxlint/vitest/build + axe +
  reduced-motion + dark fill via `var(--color-card)` + stack-limit trim for
  `TOAST_LIMIT=3` + StrictMode double-mount + z-index vs modals); adapter
  behind the seam (`roundness: 0`, bottom-right, global duration default);
  remove Base-UI toast wiring; Lab proof + CHANGELOG.

## Non-goals

Changing push copy/behavior in S1–S2; redesigning block visuals; vendoring
gooey-toast CSS beyond the package import; touching the Lab/Gallery proofs.

## Acceptance criteria

1. No `notify.confirm` in production code; `ErrorBox` retry used where pages
   improvised it; rule documented + enforced in review checklist.
2. Swapping the push provider touches only the provider file + visuals
   (no page imports the manager).
3. Gates: `tsc -b`, `oxlint`, vitest, `vite build` verdes (each phase).
