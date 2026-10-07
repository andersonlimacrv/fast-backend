# custom-ui-inputs — design

## Context

Porte existente fiel ao doc, com 2 deltas pedidos pelo dono (2026-09-30) contra o registry Watermelon.

## Decisions

1. **`bg-transparent` verbatim** — o `bg-input` criava o patch da label; `ui/input` já é `bg-background`, então nada muda nele. Rejeitado: trocar o chip para `bg-input` (quebraria sobre cards/fundos).
2. **Chip transparente (dono, revisão)** — `bg-background` virava patch em qualquer superfície ≠ fundo; o chip agora é transparente nas duas formas flutuadas. Tradeoff aberto: a borda superior atravessa o texto flutuado (screenshot 2026-09-30) — o fix estrutural seria `fieldset`/`legend` (entalhe nativo, sem linha sobre o texto), mas mata a animação de flutuação; aguardando decisão do dono.
3. **Notch medido, estrutura MDC (dono, 2026-09-30)** — consenso da pesquisa (MDC notched-outline, MUI fieldset+legend, Logto): a borda superior vira `leading` fixo + gap medido da label (`ResizeObserver`, molde do tabs) + `trailing` flexível; label sem nenhum fundo — transparente de verdade em qualquer superfície, com a flutuação preservada. Estados via `group-*` + prop `disabled` (`peer-*` não alcança spans aninhados); cantos do tema nos segmentos. **Centralização (dono, revisão)**: stub `w-2` (8px) com a label em `left-3` (12px) e pad direito 4px — 4px de cada lado do texto no gap.
4. **Coreografia espelho (dono, 2026-09-30)** — o gap andava junto com a label (150ms/150ms): agora abre em 100ms `ease-out` (pronto ~50ms antes) e fecha com `delay-75` + 100ms (a label assenta primeiro); `motion-reduce:transition-none` no gap e na label. Medido no browser: gap cheio aos ~100ms, fechamento segura antes de encolher.
5. **Autofill do browser (dono, 2026-09-30)** — o Chrome pintava o fundo oliva no campo autofilled (dono viu no lab com `_INITIAL_FIRST_USER_`). Fix (em `index.css`, fora de `@layer`, pois utilities do Tailwind venceriam a camada base e derrubariam a tinta): transição de 600000s congela o repaint de fundo (hack padrão — transitions vencem o `!important` do UA) + inset shadow com **`muted` a 60%** (escolha do dono: tinta de liquidação do campo, token como todo preenchimento do app) + `-webkit-text-fill-color`/`caret-color` por token nos dois temas; autofill funcional intacto, qualquer input/superfície.
2. **Chip transparente (dono, revisão)** — `bg-background` virava patch em qualquer superfície ≠ fundo; o chip agora é transparente nas duas formas flutuadas. Tradeoff aberto: a borda superior atravessa o texto flutuado (screenshot 2026-09-30) — o fix estrutural seria `fieldset`/`legend` (entalhe nativo, sem linha sobre o texto), mas mata a animação de flutuação; aguardando decisão do dono.
2. **`hasValue` inicial derivado** — `useState(() => ...)` de `value ?? defaultValue`; cobre não-controlado pré-preenchido e controlado. Rejeitado: medir o DOM (ResizeObserver p/ texto é overkill; o valor já está nas props).
3. **Prova como variações rotuladas** — email/password (demo do doc), pré-preenchido (o fix), disabled, plain.
4. **Testes por classe/estado** — bg, label flutuada no pré-preenchido (`-top-2.5`), disabled, tipos; jsdom não anima o float (lab).
