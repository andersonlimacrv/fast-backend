# custom-ui-checkbox — tasks

## S0 — Change (esta change)

- [x] 0.1 `client/openspec/changes/custom-ui-checkbox/{proposal,tasks,design}.md`
- [x] 0.2 Upstream consultado: `primitives-base-checkbox` (registry animate-ui) + `references/components_to_use/AnimateUi/Checkbox.md`

## S1 — Componente

- [x] 1.1 `custom-ui/components/checkbox.tsx`: contexto + Root em `motion.button` (hover/tap scale) e `CheckboxIndicator` com desenho por `pathLength` + `indeterminate`
- [x] 1.2 Estética do **componente composto do site** (`components-base-checkbox`): cva com `size-5`/`size-4.5 rounded-[5px]`/`size-6 rounded-[7px]`, `default` (`bg-background border`) vs `accent` (`bg-input`), fill `bg-primary` + `transition-colors duration-500`, indicador `size-3.5/3/4`; indicador renderizado pelo próprio componente (children primeiro)
- [x] 1.3 Delta nosso: `ring-2` (DESIGN.md §8) + reduced-motion; **sem crescimento no hover** (pedido do dono; `whileTap` mantido); `ui/**` intocado

## S2 — Catálogo + prova

- [x] 2.1 `entries.ts`: `05 source` → `custom-ui/components/checkbox.tsx` + nota
- [x] 2.2 Prova com 6 variantes (default marcado, accent, sm, lg, indeterminate, disabled) sem filho explícito

## S3 — Testes + docs

- [x] 3.1 `ui-catalog.test.tsx`: toggle por clique (`aria-checked`) + indicador presente; `aria-checked="mixed"` em `indeterminate` (32/32 verdes)
- [x] 3.2 `review-design.md` §13 (linha do 05) + §14 (dívida −1)
- [x] 3.3 `CHANGELOG.md` `[Unreleased]`

## S4 — Verificação

- [x] 4.1 **Ok visual do dono** em `/admin/lab/trials` (card 05) — validado em 2026-09-19; `status: "validated"` (prova migrou para a Gallery). Crescimento no hover removido a pedido
- [ ] 4.2 Gates quando pedidos: `tsc+build`, vitest, e2e full, `oxlint`
- [ ] 4.3 Sem commit sem pedido
