# custom-ui-files — design

## Context

O item 12 usa um porte próprio data-driven (`FileTree nodes onSelect`, 147 linhas sobre Accordion cru) em vez do `components/base/files` que o dono pediu. O upstream é composto sobre o primitivo de accordion + `Highlight`, com `FolderIcon` animado e git em letras U/M/D. Só demo+testes consomem a API antiga (sem produção).

## Goals / Non-Goals

Goals: o componente pedido, nas nossas pastas e na nossa UI; demo e testes migrados; arquivo antigo deletado. Non-goals: compat com a API antiga, validar o item (fica `pending`).

## Decisions

1. **Pasta `custom-ui/components/files/`** — regra do CLIENT-STRUCTURE (2 arquivos: `primitive.tsx` comportamento + `files.tsx` estilizado), precedente do dropdown-menu. O `source` do item 12 passa a apontar para ela.
2. **Primitivo sobre NOSSO accordion, não o Base-UI** — dono, 2026-09-23 ("comportamento igual ao nosso Accordion, se possível usar o nosso componente"): `Files`/`FolderItem` rodam no `custom-ui/accordion` (`multiple` + aberto controlado) e trigger/panel nos primitivos do `custom-ui/collapsible` — a expansão anima **igual ao Accordion validado** (`mask` + spring 150/22, ida e volta, reduced-motion), nunca seca. `FolderHeader` vira `div` simples (nosso accordion não tem parte Header), `FolderItem` neutraliza o separador dele (`border-b-0`) e `FolderPanel` força `reveal="mask"`. Rejeitado: manter o Base-UI (era o snap seco que o dono apontou).
3. **Sem `onSelect`** (dono) — fiel ao upstream: arquivos são `div`s, sem clique; pastas seguem com teclado via triggers do accordion. A nota "Selected:" da demo sai junto.
4. **Git só com cores do `index.css`** (dono) — `deleted` → `destructive`, `untracked` → `chart-2`, `modified` → `chart-4` (texto + dot); as letras U/M/D carregam o sentido (§8: nunca só cor). Sem `amber`/literais e sem o mapeamento antigo (dots `primary`/`muted`/`destructive`).
5. **`Folder` + `File` no `lib/icons.tsx`** — nomes lucide confirmados no instalado (v1.46); `FolderOpen`, `FileCode`, `FileText`, `ChevronRight` já existiam. `size-4.5` é válido no Tailwind v4.
6. **Reduced-motion no swap de ícone** — o `FolderIcon` anima `scale` em 0.15s; sob reduced-motion cai para instantâneo (requisito da casa; upstream não tem).
7. **Demo composta com o mesmo conteúdo** — src/app/docs com os mesmos git statuses da `TREE` antiga, `defaultOpen={["src"]}`; sem nota de seleção.

## Risks / Trade-offs

- [Perde a seleção de arquivos] → decisão explícita do dono (fidelidade); se um caso de produto pedir, `onSelect` volta como delta documentado.
- [Chart-2 vs chart-4 próximos] → ambos verdes; as letras U/M/D (não só a cor) distinguem os estados.
- [Duas camadas novas] → o par primitive/composto é o padrão do dropdown-menu; o accordion cru some do item.
