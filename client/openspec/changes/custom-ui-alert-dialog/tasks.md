# custom-ui-alert-dialog — tasks

## S0 — Change (esta change)

- [x] 0.1 `client/openspec/changes/custom-ui-alert-dialog/{proposal,tasks,design}.md` + aprovação do dono (2026-09-19)

## S1 — Componente

- [x] 1.1 `custom-ui/components/alert-dialog.tsx` sobre o primitivo Base UI: Root com contexto, Portal em `AnimatePresence` + `keepMounted`, Overlay com blur, Content com flip 3D (`from`), reduced-motion
- [x] 1.2 Centralização via `AlertDialog.Viewport` (sem `translate` brigando com o `transform` do motion)
- [x] 1.3 `ui/**` intocado (base shadcn; dívida §14 segue registrada)

## S2 — Catálogo + prova

- [x] 2.1 `entries.ts`: `03 source` → `custom-ui/components/alert-dialog.tsx` + nota do delta
- [x] 2.2 Prova no registro de demos importa do `custom-ui`
- [x] 2.3 Segundo gatilho `from="bottom"` na prova (comparar a direção do flip)

## S3 — Docs

- [x] 3.1 `review-design.md`: §13 (linha do 03) + §14 (dívida reduzida em 1)
- [x] 3.2 `CHANGELOG.md` `[Unreleased]`

## S4 — Verificação

- [x] 4.1 **Ok visual do dono** em `/admin/lab/trials` (card 03) — validado em 2026-09-19; `status: "validated"` (prova migrou para a Gallery)
- [x] 4.2 `from` default = **`bottom`** (pedido do dono: padrão do app) + diretriz 6 no `DESIGN.md` §7 + prova ajustada (`bottom` default, `from="top"` p/ comparar)
## S5 — Verificação

- [ ] 5.1 Gates quando pedidos: `tsc+build`, vitest, e2e full, `oxlint`
- [ ] 5.2 Sem commit sem pedido
