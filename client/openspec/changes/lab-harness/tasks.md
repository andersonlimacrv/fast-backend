# lab-harness — tasks

## S0 — Change (esta change)

- [x] 0.1 `client/openspec/changes/lab-harness/{proposal,tasks,design}.md` + aprovação do dono (renomeada de `playground` em 2026-09-19)

## S1 — Catálogo (fonte única)

- [x] 1.1 `lib/catalog/{types,entries,index}.ts`: 23 entradas (uma por doc de `references/components_to_use/`), `n` estável, `class` (component|block), `kind`, `status` (pending|validated|dropped), `ref`/`refGroup`, `source`, `usedIn[]`
- [x] 1.2 Helpers (`byClass`, `byStatus`, `validatedByClass`, `nn`, `CLASS_ORDER`, `CLASS_LABEL`)
- [x] 1.3 Registro de provas compartilhado (`components/catalog-demos.tsx`, keyed por slug) + `components/catalog-meta.tsx` (status badge + usedIn)

## S2 — Páginas (staff, sob `/admin`)

- [x] 2.1 `/admin/lab`: lista completa separada em Components/Blocks com `n`, `kind`, `status`, `source`, `note`
- [x] 2.2 `/admin/lab/trials`: provas vivas dos `pending` (mesmo registro de demos)
- [x] 2.3 `/admin/gallery`: só `validated`, separado em Components/Blocks, com prova + `usedIn` (link quando há rota)
- [x] 2.4 `ROUTES` (`adminLab`, `adminLabTrials`, `adminGallery`) + `App.tsx` + sidebar Admin (`Gallery`, `Lab`) + `page-trail`

## S3 — Verificação

- [ ] 3.1 **APRESENTAR ao dono ANTES dos gates** (ordem permanente)
- [ ] 3.2 Gates: `tsc+build`, vitest, e2e full, `oxlint` (só quando o dono pedir)
- [ ] 3.3 Sem commit sem pedido

## S2+ — Fila 1-a-1

- [ ] Cada item vira `client/openspec/changes/lab-<slug>/` própria, na ordem de prioridade do dono; validar = flipar `status` no catálogo (a prova migra de Trials para Gallery).
- [ ] Carimbados sem porte novo: `Sidebar`, `DropdownMenu`, `CopyButton`, `FileTree` (+ parte de `Tooltip`).
