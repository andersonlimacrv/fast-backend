# run-action-button-type — tasks

## S0 — Change

- [x] 0.1 `client/openspec/changes/run-action-button-type/{proposal,tasks,design}.md` + pedido do dono

## S1 — Tipografia

- [x] 1.1 `text-[18px]` → `text-sm` nos 3 estados; `font-bold` → `font-medium`
- [x] 1.2 Ícones `h-6 w-6` → `h-5 w-5`; largura running 360 → 320
- [x] 1.3 Idle + done (sem X): conteúdo (ícone + texto) com `justify-center`; running intacto (tem X, segue `justify-between`)

## S2 — Docs + verificação

- [x] 2.1 `entries.ts` n=16 (nota) + CHANGELOG (file-upload restaurado + run-action)
- [x] 2.2 Ok visual do dono no card 16 → `status: "validated"` — **validado em 2026-10-09**
- [x] 2.3 Gates: `tsc -b`, `oxlint`, vitest, build — **verdes** (`tsc` limpo, oxlint sem achado no arquivo, catálogo 76/76, `vite build` ok)
- [ ] 2.4 Sem commit sem pedido
