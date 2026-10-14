# custom-ui-file-upload — design

## Context

Snap seco ao adicionar/remover arquivos (dono, 2026-10-01). Molde: Accordion
próprio (`mask` reveal + spring 150/22, `AnimatePresence` nos dois sentidos).

## Decisions

1. **Altura animada, não máscara** — a lista cresce para baixo (conteúdo novo
   empurra); `height: 0 → auto` com o spring do Accordion. Rejeitado: fade
   simples (não move tamanho) e `layout` puro (sem controle da curva).
2. **Entrada e saída** (dono) — remover recolhe simétrico; `AnimatePresence`
   com `mode="popLayout"`? Não: lista vertical simples, `sync` basta; cada
   bloco `key={uf.id}` com exit próprio.
3. **`motion-reduce` seco** — política da casa (§7); `useReducedMotion` pula
   o `AnimatePresence` animado (render direto).
4. **Testes por estado** — jsdom não mede altura animada; cobre blocos,
   contadores e resumo (o slide fica para o lab).
5. **S5 — fim da exclusão sem snap (dono, follow-up)**: o exit da row zerava
   `height/padding` mas mantinha `border` (2px) + `gap-2` do pai (8px, fora do
   nó animado com `overflow`) — a altura animava até ~10px e o unmount engolia
   o resto. Fix: gap do pai vira `mb-2` por item com `marginBottom: 0` no exit
   + `borderWidth: 0`, `overflow` persistente, `popLayout` no `AnimatePresence`
   interno. Section perde o `layout` (brigava com o exit da row); `gap-4` do
   `CardContent` vira margem animada do wrapper do drop-zone (gap fora do nó
   animado quebra do mesmo jeito no unmount da section). Drop-zone ganha o
   mesmo enter/exit (limite de 6 sem snap).
6. **S5 — exit em tween (dono)**: enter mantém o spring 150/22 (fidelidade ao
   Accordion); exit usa tween ~180ms `easeInOut` — spring tem cauda longa e o
   `AnimatePresence` desmonta no meio do settle, o que lê como corte seco.
7. **S5.5 — sem `last:mb-0` (dono: snap só no ÚLTIMO)**: `mb-2` uniforme por
   row + `-mb-2` estático no container (resumo a 16px exatos); seletor
   `:last-child` flipava 8px no commit da exclusão do último sem nada para
   deslizar — com 1 item não há irmãos, por isso só o último quebrava.
