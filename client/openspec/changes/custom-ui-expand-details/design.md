# custom-ui-expand-details — design

## Context

O doc do 11 tem duas variantes do mesmo bloco: `expand-details-base.tsx` (tokens, sem wrapper de tela cheia) e `expand-details.tsx` (zinc fixo, `h-screen`, typo `btransition-colors`). Ambas importam `react-use-measure`, que **não está no bloco de install** do próprio doc (dependência fantasma, `review-design` §7) e não existe no projeto. O item está deferido no §9 ("sem encaixe definido") e sem `source` no catálogo.

## Goals / Non-Goals

Goals: porte fiel (coreografia idêntica), token-first, sem dependência nova, provado no lab. Non-goals: instalar `react-use-measure`, portar zinc/`h-screen`, uso em produção.

## Decisions

1. **ResizeObserver em vez de `react-use-measure`** — o pacote resolveria a mesma medida (`offsetSize`), mas é uma dependência nova (e fantasma no doc) para algo que o browser dá de graça. O componente mede o conteúdo com um observer local, mantendo o fallback do doc (`height: auto` quando a medida ainda é 0) e um guard para ambientes sem RO (jsdom) — os testes continuam determinísticos. Rejeitado: instalar a dep (Structural change + peso sem ganho) e medir com `scrollHeight` em cada render (força layout/leitura síncrona).
2. **Tokens, não zinc** — a variante `-base` do doc já usa exatamente o nosso vocabulário (`bg-card`, `border-border`, `text-card-foreground`, `text-muted-foreground`); a variante zinc é ruído de demo (§12 registra o padrão "variantes com zinc/hex"). Rejeitado: manter o zinc (quebraria o tema).
3. **Coreografia sem os cantos** — springs `200/22/1.2`, delays invertidos (`width` espera no collapse, `height` espera no expand), chevron `-90°` em 0.2s (delay 0.3s), painel com blur de 8px + y e `popLayout`. O `borderRadius` animado do doc (20↔24, morph aberto→pill) foi **descartado pelo dono (2026-09-23)**: "não fica efeito pill e sim uma div que alterna o tamanho" e **as bordas sempre vêm do estilo atual (variáveis do `index.css`)**. O card usa `rounded-xl` (resolve `var(--radius-xl)`; 4px no tema atual, igual ao `CreditUsageCard`) — raio estático, do tema, sem JS nem hardcode. Rejeitado: manter o morph (cantos fora da linguagem do app) e cravar pixels no componente.
4. **O wrapper `h-screen` fica fora** — no doc ele é o palco do demo (centralização), não o bloco; o componente é o card medido e a prova do lab centraliza. Rejeitado: embutir `h-screen` (o bloco de catálogo passaria a impor layout de página).
5. **Conteúdo data-driven** — `items` com `label`/`value`/`wide` e default igual ao doc; o pedido recente do dono é modularizar, e o bloco fica reutilizável (ex.: detalhes de um run). `title` também é prop (default "Details").
6. **A11y mínima** — `aria-expanded` no botão (o doc não tem), `ring-2` de foco (§8), ícone `aria-hidden`; o painel não precisa de `aria-controls` id estável para o padrão disclosure simples, mas o botão é um `<button>` real (o doc usa `motion.button`) — semântica nativa preservada.

## Risks / Trade-offs

- [RO em jsdom] → guard + fallback `auto`: os testes cobrem abertura/colapso pelo `aria-expanded` e pelo painel, não a medida (que é visual, validada no lab).
- [Altura animada + `popLayout`] → a combinação é a do doc; se o dono quiser outro tempo, é o `SPRING_CONFIG` num lugar só.
- [Sem caso de uso] → segue `usedIn: []`; o valor agora é a fila (falta só o 18) e o bloco disponível para quando aparecer o encaixe.
