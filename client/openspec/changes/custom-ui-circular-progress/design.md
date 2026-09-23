# custom-ui-circular-progress — design

## Context

O item 04 apontava para `custom-ui/components/circular-progress.tsx`, um porte **simplificado** do `AnimatedCircularProgressBar` (registry magicui): um anel via `strokeDashoffset` com transição de 200ms, sem o gap de 5% nem as duas trilhas em CSS vars. O dono avaliou como "errado" frente ao componente do site e pediu o efeito de entrada (0 → valor) com uma prop default `true`.

Fonte canônica consultada em 2026-09-19: registry item `@magicui/animated-circular-progress-bar` + o demo `animated-circular-progress-bar-demo` + o doc local `references/components_to_use/AnimatedCircularProgressBar.md`.

## Goals / Non-Goals

Goals: desenho e movimento iguais ao upstream; efeito de montagem com contador; a11y que o upstream não tem; API que não quebra os consumidores atuais. Non-goals: portar outros itens; validar pelo dono; mexer em `/ui`.

## Decisions

1. **Copiar a técnica do upstream, não o arquivo** — dois `<circle>`, CSS vars (`--gap-percent: 5`, `--percent-to-px`, `--percent-to-deg`, `--circumference`, `--offset-factor`) e `strokeDasharray` em `calc`; o secundário usa `scaleY(-1)` + rotação inversa e só existe com `0 ≤ % ≤ 90` (é o gap no topo). Rejeitado: manter o `strokeDashoffset` antigo (era justamente o que não parecia com o site).
2. **Um driver JS em vez de transição CSS + contador JS** — o upstream anima o anel por transição CSS e mostra o número final de uma vez; para o contador subir **junto** com o anel, ambos são dirigidos por `animate()` do motion com a bezier do CSS `ease` (`[0.25, 0.1, 0.25, 1]`). Dois drivers (CSS no anel + rAF no número) desandariam de easing. Rejeitado: `setInterval` de 100ms (degraus visíveis) e `@property` registrada (não resolveria o contador).
3. **`animateOnMount` (default `true`)** — pedido do dono: a cada montagem o gauge começa em `min` e vai até `value` em `transitionLength` (default 1000ms, igual ao upstream). `false` (ou duração 0/reduced-motion) mostra o valor final já no primeiro render.
4. **Decisão derivada no render, não `setState` em efeito** — `jumpsToTarget` é calculado no corpo; o efeito só agenda quando há transição real. Evita o warning `react(set-state-in-effect)` e o frame inútil.
5. **A11y mantida e correta durante a animação** — `role="progressbar"` + `aria-valuemin/max/now/valuetext` refletem o **valor real** (`value` clampado), não o frame; o valor pintado vai para `data-current-value` (atributo do upstream) e é `aria-hidden` no svg/label. Rejeitado: expor o frame em `aria-valuenow` (o leitor de tela anunciaria dezenas de valores).
6. **Cores por token e knobs expostos** — defaults `var(--color-chart-1)`/`var(--color-muted)` (o hex do demo upstream era só exemplo) e `transitionLength` configurável; o gap fica fixo em 5% (desenho do upstream). Rejeitado: exigir cores (quebraria o tema) e expor `gapPercent` (sem caso de uso).
7. **API preservada** — `value`, `min`, `max`, `size`, `strokeWidth`, `showValue`, `className` continuam; nada quebra (prova e demo de Tabs seguem válidos) e o número mantém `%` e figuras tabulares (DESIGN.md §4.3, evita jitter durante a contagem).

## Risks / Trade-offs

- [Contador com rAF custa 60 frames por transição] → duração de 1s e só na montagem/mudança de valor; `prefers-reduced-motion` e `transitionLength ≤ 0` pulam direto.
- [Gap de 5% e `scaleY(-1)` são sensíveis a `viewBox`] → `viewBox` fixo em `0 0 100 100` como no upstream; `size` só escala o wrapper.
- [Divergência do upstream no timing do número] → intencional (é o pedido do dono); o anel mantém a curva `ease` e a duração de 1s.
