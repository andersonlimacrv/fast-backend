# run-action-button-type — proposal

## Why

Item 16 (`RunActionButton`) behavior is fine (owner, 2026-10-09), but its
letters are oversized: `text-[18px]` hardcoded in all three states (idle /
running / done) against the app standard (`text-sm`, e.g. `ui/button`,
sidebar, `FileUploader`). Icons at `h-6 w-6` pair with the big type.

## What Changes

- **`run-action-button.tsx`**: `text-[18px]` → `text-sm` (idle/running/done);
  `font-bold` → `font-medium` (running/done, matching `buttonVariants`);
  step/state icons `h-6 w-6` → `h-5 w-5`; running width 360 → 320 (longest
  default label fits at 14px, less slack).
- **No token changes**: audit confirms house tokens only (`bg-muted`,
  `bg-secondary`/`text-secondary-foreground`, `bg-accent` /
  `text-accent-foreground`, `border-border`, `text-foreground`, `ring-ring`,
  `rounded-lg`); icons via `lib/icons` (regra de ouro); no hex/zinc/arbitrary
  colors.
- **Docs**: `entries.ts` n=16 (nota) + CHANGELOG.

## Non-goals

Redesigning the 64px height or stage behavior; validating the item (stays
`pending` until the owner visual ok); touching any other component.

## Acceptance criteria

1. All three states read at app type scale (`text-sm font-medium`).
2. Tokens unchanged (audit above holds).
3. Gates: `tsc -b`, `oxlint`, vitest, `vite build` verdes.
