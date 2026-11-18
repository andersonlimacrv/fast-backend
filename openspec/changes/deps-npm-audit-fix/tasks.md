# deps-npm-audit-fix — tasks

## S0 — Change

- [x] 0.1 `openspec/changes/deps-npm-audit-fix/proposal.md`

## S1 — Patch float

- [x] 1.1 `npm audit fix` (sem `--force`) no `client/` (vite, source-map-js,
      undici + transitivas)
- [x] 1.2 Bumps manuais `vitest 5.0.1 → 5.0.5`, `zod 4.6.5 → 4.6.7`
      (`package.json` + lock) — ambos fora do range, `--force` rejeitado

## S2 — Verificação

- [x] 2.1 `npm audit` zerado (0 vulnerabilidades)
- [x] 2.2 `npm test` (175), `tsc -b`, `npm run build`, `oxlint` 0 erros
- [x] 2.3 smoke Playwright 3/3 com API no ar (sem API, `landing.png` difere —
      ambiental, pré-existente)
- [x] 2.4 `CHANGELOG.md` `[Unreleased]`; `git status`; sem commit sem pedido
