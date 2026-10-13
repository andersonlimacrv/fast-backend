# custom-ui-file-upload — proposal

## Why

Item 13 (`FileUploader`) validado no comportamento, mas a janela expande e
recolhe **a seco** ao adicionar/remover arquivos (dono, 2026-10-01). O padrão
da casa é transição de tamanho como no Accordion (reveal + spring 150/22) —
vira regra do design system.

## What Changes

- **`file-uploader.tsx`**: lista de arquivos + linha de resumo/tamanho com
  animação de altura (`height: auto`, spring 150/22 do Accordion) na entrada
  **e** na saída via `AnimatePresence`; `motion-reduce` cai para seco.
- **`DESIGN.md` §7**: regra "mudança de tamanho anima, nunca snap seco",
  com o FileUploader como referência.
- **Prova**: demo do item 13 mostra adicionar/remover com a transição.
- **Testes**: presença/ausência dos blocos + contadores (animação = visual).
- **Docs**: `entries.ts` n=13 (nota) + CHANGELOG.

## Non-goals

Validar o item (fica `pending` até o ok visual); auditar outros componentes
(decisão do dono: só file-upload + regra).

## Acceptance criteria

1. Adicionar arquivo(s) expande a janela com spring; remover recolhe.
2. `prefers-reduced-motion`: aparece/some sem animar.
3. Gates: `tsc -b`, `oxlint`, vitest, `vite build` verdes.
