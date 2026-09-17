# playground — tasks

## S0 — Change (esta change)

- [x] 0.1 `client/openspec/changes/playground/{proposal,tasks,design}.md` + aprovação do dono

## S1 — Scaffold (eu)

- [x] 1.1 `ROUTES.playground*` + rotas + breadcrumb + item Admin (`FlaskConical` via `lib/icons`)
- [x] 1.2 `pages/playground/` (índice com fila+status, components, blocks placeholder), tudo `RequireStaff`
- [ ] 1.3 **APRESENTAR ao dono ANTES dos gates** (ordem permanente — apresentação entregue no relato de 2026-09-17, aguardando aceite)
- [x] 1.4 Gates: `tsc+build`, vitest, e2e full, `oxlint` (verificado 2026-09-17: tsc 0, build ok, vitest 102/102, e2e 14/14 em stack isolado, oxlint só warnings pré-existentes)
- [ ] 1.5 Sem commit sem pedido

## S2+ — Backlog fatiado (decisão do dono 2026-09-17: uma change por componente, não uma change longa)

- [ ] `404PageNotFound` → `Accordion` → `AlertDialog` → `AnimatedCircularProgressBar` → `Checkbox` → `CopyButton` → `CreditUsageCard` → `DeplymentCard` → `Dialog` → `DropdownMenu` → `ExpandDetails` → `FileTree` → `FileUpload` → `Inputs` → `Radio` → `RunActionButton` → `Sidebar` → `SubsriptionCalendar` → `SwitchModeToggle` → `Tabs` → `ToggleGroup` → `Tooltip` → `UserAvatar`
- [ ] Carimbados sem porte novo: `Sidebar`, `DropdownMenu`, `CopyButton`, `FileTree` (+ parte de `Tooltip`)
- [ ] Regra: cada item vira `client/openspec/changes/playground-<slug>/` própria (proposal+tasks+design) por ordem de prioridade do dono; S1 (scaffold) arquiva independente da fila.
