# custom-ui-files — tasks

## S0 — Change

- [x] 0.1 `client/openspec/changes/custom-ui-files/{proposal,tasks,design}.md`
- [x] 0.2 Fonte lida (`components-base-files` + `primitives-base-files` via `animate-ui.com/r/*.json`) + inventário: `file-tree.tsx` só com demo+testes, `Folder`/`File` a adicionar em `lib/icons`

## S1 — Componentes

- [x] 1.1 `custom-ui/components/files/primitive.tsx`: vendored (`Files` + `Folder*` + `File*` + `FolderIcon` + `Highlight`) sobre Base-UI + `effects/highlight` + `getStrictContext` + `useControlledState`; sem `'use client'`
- [x] 1.2 `custom-ui/components/files/files.tsx`: composto (`Files`, `SubFiles`, `FolderItem`, `FolderTrigger` + `gitStatus`, `FolderPanel`, `FileItem` + `icon`/`gitStatus`); ícones via `lib/icons`; `size-4.5`, `text-sm`, `rounded-lg` + `bg-accent`
- [x] 1.3 Cores git só do `index.css`: `deleted` → `destructive`, `untracked` → `chart-2`, `modified` → `chart-4` (letras U/M/D carregam o sentido)
- [x] 1.4 Sem `onSelect` (fiel ao upstream); reduced-motion no swap de ícone; `ring-2` de foco (§8)

## S2 — Demo + testes + deleção

- [x] 2.1 `catalog-demos.tsx`: demo reescrita em forma composta (mesmo conteúdo) — sai `FileTree`, `FileTreeNode`, `TREE`, nota de seleção
- [x] 2.2 `ui-catalog.test.tsx`: `describe("file-tree")` vira `describe("files")` (expandir/colapsar, U/M/D)
- [x] 2.3 Deletar `custom-ui/components/file-tree.tsx`
- [x] 2.4 `lib/icons.tsx`: `File` + `Folder`

## S3 — Docs

- [x] 3.1 `entries.ts` n=12 (`source: custom-ui/components/files/` + nota)
- [x] 3.2 `review-design` §13 (linha 12 nova) + CHANGELOG

## S4 — Verificação

- [x] 4.1 Ok visual do dono no card 12 → `status: "validated"` — **validado em 2026-09-23** (comportamento do Accordion validado junto)
- [ ] 4.2 Gates: `tsc`, `oxlint`, catálogo, build
- [ ] 4.3 Sem commit sem pedido
