# deps-npm-audit-fix — proposal

## Why

`npm audit` on `client/` reports 4 vulnerabilities (2 high, 2 moderate),
all in build/test tooling: `vite 8.3.0` (launch-editor + middleware CVEs),
`source-map-js 1.2.1` (DoS via crafted indexes) and `@vitest/mocker 5.0.1`
(code injection via unauthenticated manual mocks). Nothing ships to the
browser, but `make security`'s spirit (and a future `npm audit` gate) wants
the tree clean.

## What Changes

- `npm audit fix` (no `--force`): `vite 8.3.5`, `source-map-js 1.2.2`,
  plus floated transitives (`rolldown`, `postcss`, `nanoid`,
  `@rolldown/binding-linux-x64-gnu`, `@oxc-project/types`).
- Manual pin bump `vitest 5.0.1 → 5.0.5` in `client/package.json` (+ lock):
  the mocker fix is outside the current range, and `--force` would jump
  majors — rejected.
- Gates: `npm test` (175), `tsc -b`, `npm run build`, smoke Playwright,
  `npm audit` clean.

## Capabilities

- None (tooling hygiene; no behavior change).

## Impact

- `client/package.json` + `client/package-lock.json` only. No source, no
  runtime, no config.

## Non-goals

- Major bumps (`vitest` 6, `vite` 9): separate change with migration notes.
- Adding an `npm audit` CI gate (follow-up once the tree is proven clean
  over time).

## Acceptance criteria

1. `npm audit` reports 0 vulnerabilities.
2. `npm test`, `tsc -b`, `npm run build`, smoke spec (`login.png` baseline
   included) all green.
3. `CHANGELOG.md` `[Unreleased]` entry; no source diff.
