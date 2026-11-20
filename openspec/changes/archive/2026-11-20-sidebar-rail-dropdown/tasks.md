# sidebar-rail-dropdown — tasks

## S0 — Change

- [x] 0.1 `openspec/changes/sidebar-rail-dropdown/proposal.md`

## S1 — Diagnose

- [x] 1.1 Lido `dropdown-menu.tsx` (porte Radix animate-ui; vars `--radix-*`
      reais) + primitivo com animação `motion` (`scale 0.95 → 1`)
- [x] 1.2 Reproduzido local (API no ar): passa aqui; no CI falha 2x idêntico —
      ambiente-dependente, não determinístico do código
- [x] 1.3 Causa: Radix posiciona o menu de forma assíncrona pós-mount
      (Floating UI mede e depois coloca); o teste lia `boundingBox()` uma
      única vez com o menuitem já visível — frame pré-posicionamento no
      runner mais lento. Flip genuíno é implausível (menu ≥224px cabe com
      folga à direita em 768px)

## S2 — Fix

- [x] 2.1 `expectMenuRightOfTrigger` com `expect.poll`: mesmo assert, retried
      até assentar (timeout 5s). Não mascara bug real — flip de verdade
      continuaria falhando após o timeout
- [x] 2.2 `sidebar.spec.ts` inteiro verde local (4/4)

## S3 — Verificação

- [x] 3.1 `npm run lint`, `tsc -b`, `npm test` — verdes em 2026-11-19 (oxlint sem erros, `tsc -b` limpo, vitest 175/175 em 18 arquivos)
- [x] 3.2 Push + CI `web-e2e` verde (run 44666594613, 2026-11-20: lint/security/web/unit/integration success; web com `make web-e2e-install` + `make web-e2e`); `git status` limpo
