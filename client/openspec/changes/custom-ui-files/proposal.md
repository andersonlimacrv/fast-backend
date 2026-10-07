# custom-ui-files — proposal

## Why

O item 12 (`FileTree`) usa um porte próprio data-driven (`FileTree nodes onSelect`, sobre Accordion cru) em vez do componente que o dono pediu: o **`components/base/files`** do animate-ui (dono, 2026-09-23: "reescreva todo o file tree, sendo que eu quero esse componente", "nas nossas directories e condizente com nossa UI"). O upstream é **composto** (`Files/FolderItem/FolderTrigger/FolderPanel/FileItem` sobre o primitivo de accordion + `Highlight`), com highlight animado que segue o mouse, ícone de pasta que troca open/close e letras U/M/D de git — nada disso existe na nossa versão.

## What Changes

- **Deleta** `custom-ui/components/file-tree.tsx` (147 linhas; só demo+testes consomem — sem uso em produção).
- **Novo `custom-ui/components/files/primitive.tsx`** — API do `primitives-base-files` religada no **nosso accordion** (dono: comportamento igual ao Accordion): `Files`/`FolderItem` sobre `custom-ui/accordion` (`multiple` + aberto controlado), triggers e painéis sobre os primitivos do `custom-ui/collapsible` — a expansão anima igual ao validado (`mask` + spring 150/22, ida e volta); `FolderHeader` vira `div` (sem parte Header no nosso), `FolderItem` neutraliza o separador (`border-b-0`), `FolderPanel` força o `mask`. Resto igual: `File*`, `FolderHighlight`, `FolderIcon` (swap animado), `Highlight`, `getStrictContext`, `useControlledState`; sem `'use client'`.
- **Novo `custom-ui/components/files/files.tsx`** — composto de `components-base-files`: `Files` (`p-2 w-full` + highlight `bg-accent rounded-lg`), `SubFiles`, `FolderTrigger` (label + `gitStatus`), `FolderPanel` (guia `ml-6 before:bg-border`), `FileItem` (`icon` + `gitStatus`); ícones via `lib/icons` (adiciona `Folder` + `File`, confirmados no lucide instalado); `size-4.5`, `text-sm`, `rounded-lg`; **sem `onSelect`** (fiel — decisão do dono; pastas seguem acessíveis por teclado via triggers).
- **Cores git só do `index.css`** (dono): `deleted` → `destructive`, `untracked` → `chart-2` (legível), `modified` → `chart-4` — letras U/M/D carregam o sentido (§8); sem `amber`/literais.
- **Demo reescrita** em forma composta (mesmo conteúdo da `TREE`: src/app/docs com git statuses) + **testes trocados** (expandir/colapsar, letras U/M/D).
- **Docs**: `entries.ts` n=12 (`source: custom-ui/components/files/`), `review-design` §13 (linha 12 nova), CHANGELOG, `lib/icons`.

## Capabilities

### New Capabilities

- Nenhuma.

### Modified Capabilities

- `lab-harness`: item 12 com o componente pedido, em prova composta.

## Impact

- Novos: `client/src/components/custom-ui/components/files/{primitive.tsx,files.tsx}`, change `custom-ui-files`.
- Deletado: `client/src/components/custom-ui/components/file-tree.tsx` (+ `FileTreeNode`, `onSelect`, ext-icons, `GitDot` — arquitetura antiga sai por inteiro).
- Alterados: `lib/icons.tsx` (`File`, `Folder`), `catalog-demos.tsx`, `ui-catalog.test.tsx`, `entries.ts` (n=12), `review-design` §13, CHANGELOG.
- **Intocados**: tokens, páginas, demais itens.

## Non-goals

Manter compat com a API antiga (`FileTree`/`FileTreeNode`/`onSelect` somem — sem consumidores em produção); `CheckboxItem` de arquivo (o upstream não tem); validar o item (fica `pending` até o ok visual).

## Acceptance criteria

1. `/admin/lab/trials` → card `12 FileTree`: mesma árvore de antes (src/app/docs), pastas expandem/colapsam, highlight desliza sob o mouse, ícone da pasta troca, letras U/M/D com as cores do tema.
2. Teclado: triggers de pasta focáveis (Tab/Enter/Espaço), `ring-2` visível.
3. Sem `onSelect`: clicar num arquivo não faz nada além do highlight (fiel ao upstream).
4. Gates: `tsc`, `oxlint`, catálogo e build verdes.
