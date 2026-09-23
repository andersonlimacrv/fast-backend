# custom-ui-alert-dialog — design

## Context

Regra de camadas (dono): `/ui` = base shadcn intocada; componente visual de página vive em `/custom-ui`. O item 03 estava em `ui/alert-dialog.tsx` (dívida §14). O primitivo upstream `primitives-base-alert-dialog` (registry consultado em 2026-09-19) traz backdrop com blur + popup com flip 3D, ambos com exit; o porte em `/ui` só animava a entrada.

## Goals / Non-Goals

Goals: convergir o 03 para `custom-ui` com a coreografia do upstream; manter API/nomes consumidos pela prova; reduzir a dívida §14 em 1. Non-goals: editar `/ui`, validar o item (dono), mexer em outros itens.

## Decisions

1. **AnimatePresence no Portal, não no Popup** — fiel ao upstream: `{isOpen && <Portal keepMounted>}` dentro do `AnimatePresence`; como o popup é o elemento `motion` (via `render`), o exit roda antes do desmonte. Rejeitado: `motion.div` filho do Popup (o `transform` do motion brigaria com a centralização por `translate`).
2. **`render={<motion.div/>}` (Base UI)** — a API de render prop do Base UI v1.8 (confirmada em `internals/types.d.ts`); o elemento vira o próprio popup, herdando handlers/foco/aria do primitive. Rejeitado: `asChild` (sintaxe do radix, não existe aqui).
3. **Centralização por `AlertDialog.Viewport`** — container flex do Base UI, evita o `transform` do Tailwind competindo com o `perspective/rotate` do motion (que era o motivo de a versão antiga animar só por dentro). Rejeitado: `inset-0 m-auto` (frágil com `h-fit`).
4. **`from: top|bottom|left|right` com default `bottom`** — mesma prop do upstream (`rotateX` para vertical, `rotateY` para horizontal, rotação inicial ±20deg). O default upstream é `top`; o dono escolheu **`bottom`** por estética (2026-09-19) e pediu para valer no app inteiro — registrado como diretriz 6 do `DESIGN.md` §7. Rejeitado: manter `top` (o dono avaliou e preferiu baixo).
5. **Blur: `backdrop-blur` no overlay (estático) + animado no popup** — o upstream anima `filter: blur()` no backdrop, mas sobre uma camada preta chapada isso é **invisível** (blur de cor uniforme = mesma cor); o efeito que se enxerga é `backdrop-filter` (fosco atrás do overlay). Então: overlay com `backdrop-blur-sm` estático + fade de `opacity`; popup mantém `filter: blur(4px→0)` animado (ali é visível, o conteúdo amolece). Ambos bounded e curtos — exceção de GPU consciente, registrada no ledger.
6. **Nomes mantidos** (`Overlay`, `Content`, `Action`, `Cancel`) — só a prova consome; manter os nomes evita churn nos imports.
7. **Spring mais rápido que o upstream** — 500/32 (~0.25s para assentar) em vez de 150/25 (~0.33s): pedido do dono ("um pouco mais rápido") e alinhado à faixa 120–250ms do `DESIGN.md` §7. Mantém o caráter de mola; o backdrop caiu para 0.15s. `transition` segue sobrescrevível por prop.

## Risks / Trade-offs

- [Primeira vez que o repo usa `render` do Base UI] → validado por `tsc` e pela prova visual; o upstream usa exatamente esse caminho.
- [`AlertDialog.Viewport` cobre a tela] → AlertDialog do Base UI é não-dismissible (fora/press não fecha), então não há perda de comportamento; `p-4` melhora telas pequenas.
- [Duplicação temporária com `ui/alert-dialog.tsx`] → é a dívida declarada; o arquivo de `/ui` fica sem consumo e converge quando pudermos (regra: não editar `/ui` agora).
