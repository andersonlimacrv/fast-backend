# root-mode — tasks

## S0 — Change

- [x] 0.1 `openspec/changes/root-mode/{proposal,tasks,design}.md` + aprovação do dono

## S1 — Ícones

- [x] 1.1 `Crown` em `lib/icons.tsx` (re-export nomeado; regra de ouro)

## S2 — RootBadge

- [x] 2.1 `components/admin/root-badge.tsx` (card + compacta, tokens, `ring-2`)
- [x] 2.2 Testes: render root/não-root, chevron, aria

## S3 — Menu do usuário

- [x] 3.1 Footer (`app-sidebar.tsx`): card Modo Root + grupo "Ações root" (grant/revoke → `/admin/users`), só `isRoot(me)`; sem divider duplo (o fragmento root não fecha com separator — o original antes do Account basta)

## S4 — Coroas

- [x] 4.1 Botões Grant/Revoke staff com coroa + `aria-label` "somente root"

## S5 — Matriz

- [x] 5.1 `capabilitiesFor()` em `services/admin.ts` + testes (espelho de `policies.py`)
- [x] 5.2 Card "Níveis de acesso" em `AdminUsersPage`

## S6 — Docs

- [x] 6.1 CHANGELOG (behavior) + padrão do badge em `DESIGN.md`

## S7 — Verificação

- [ ] 7.1 Ok visual do dono (root e não-root, dois temas)
- [x] 7.2 Gates: `tsc -b`, `oxlint`, vitest, build — **verdes em 2026-10-13** (`tsc` limpo, oxlint só warnings pré-existentes, vitest 169/169, `vite build` ok)
- [ ] 7.3 Sem commit sem pedido
