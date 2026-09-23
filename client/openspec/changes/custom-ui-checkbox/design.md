# custom-ui-checkbox — design

## Context

O item 05 vivia em `ui/checkbox.tsx` (customizado no `animate-ui-adoption`: variantes + `motion` no svg), contra a regra de camadas. O upstream `primitives-base-checkbox` tem outra forma: contexto, Root como `motion.button` com escalas de hover/tap e o indicador **como filho explícito**, desenhando o check por `pathLength` — além de suportar `indeterminate`.

## Goals / Non-Goals

Goals: convergir o 05 para `custom-ui` com o comportamento do upstream + manter os deltas aprovados (variantes/tamanhos/tokens/reduced-motion); reduzir a dívida §14 em 1. Non-goals: editar `/ui`; validar pelo dono; outros itens.

## Decisions

1. **Portar o componente composto, não só o primitive** — a primeira tentativa manteve a estética antiga do nosso porte (caixa 16px, `rounded-sm`, indicador como filho obrigatório) e o dono **rejeitou visualmente**; o registry `components-base-checkbox` traz a estética aprovada (cva: `size-5`, sm/lg mais arredondados, `accent` = `bg-input`, fill `bg-primary`, `transition-colors duration-500`) e renderiza o indicador por dentro. Rejeitado: manter o indicador como filho obrigatório (muda a DX sem ganho) e reusar as classes antigas.
2. **`motion.button` via `render` (Base UI)** — mantém o Root do primitive (input nativo escondido, teclado, ARIA) e deixa a animação de hover/tap no elemento renderizado, como no upstream. Rejeitado: animar por classe CSS (perde o spring do `whileTap`).
3. **Props Base UI ficam no `CheckboxPrimitive.Root`; nada de espalhar props tipadas do Base UI no `motion.button`** — os handlers do Base UI usam `BaseUIEvent` e colidem com os do motion (`HTMLMotionProps`) na checagem de tipos; deixar o merge com o próprio Base UI resolve sem `as any`. Rejeitado: unir as duas tipagens (erro TS2320 real, testado).
4. **`useCheckbox` fica interno** — exportar o hook junto dos componentes dispara `oxlint only-export-components` (fast refresh). Se alguém precisar, exporta-se depois com uma decisão explícita. Rejeitado: manter paridade de exports com o upstream (novo warning sem consumidor).
5. **`variant`/`size` preservados** — já aprovados no demo de referência (Bold/Italic/Underline não; aqui default/accent e sm/default/lg) e usados na prova; nenhum consumidor de produção depende deles, mas mantêm a paridade com o porte antigo.
6. **Sem crescimento no hover** — o primitive escala `1.05` no `whileHover`; removido a pedido do dono (2026-09-19: leitura poluída). A escala de **press** (`whileTap` `0.95`) fica, é o feedback do clique. Rejeitado: manter o hover e só reduzir a escala (o dono pediu para tirar o efeito).
7. **Reduced-motion desliga o que sobrou de movimento** — `whileTap` vira `undefined` e as durações de `pathLength` vão a 0; o `keepMounted` do indicador permanece (é ele que permite o desenho de saída).

## Risks / Trade-offs

- [Mudança de API do porte antigo (indicador obrigatório como filho)] → nenhum consumidor fora da prova; registrado no `entries.ts` e no CHANGELOG.
- [`motion.button` dentro de `<label>`] → comportamento padrão do upstream; o clique no label aciona o input do Base UI.
- [Fade+scale → desenho por `pathLength`] → é o efeito do registry; se o dono preferir o antigo, o ajuste é local ao indicador.
- [Hover removido diverge do primitive do registry] → registrado aqui, no `entries.ts` e no `review-design` §13; é uma decisão de dono, não uma regressão.
