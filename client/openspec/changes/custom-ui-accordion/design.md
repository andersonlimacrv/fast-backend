# custom-ui-accordion — design

## Context

Regra de camadas (dono): `/ui` = base shadcn intocada; `/custom-ui` = componente visual usado pela página (pode compor `/ui` por baixo). O histórico deixou motion reconciliado dentro de `/ui` (9 arquivos, dívida §14) e o item 02 apontava para um deles. Padrão visual desejado: o `Collapsible` vendored (radix + `AnimatePresence`), que anima **abrir e fechar** — o `ui/accordion` só anima abrir.

## Goals / Non-Goals

Goals: accordion próprio em `custom-ui` sobre o `Collapsible`; catálogo apontando para ele; `Collapsible` catalogado (está em produção, faltava); regra e dívida documentadas. Non-goals: editar/mover `/ui`; validar o item (dono); portar outros itens.

## Decisions

1. **Accordion sobre o `Collapsible`, não sobre o `ui/accordion`** — o `Collapsible` já resolve o fechamento animado e é o padrão aprovado na sidebar; reaproveitar evita segundo primitive de disclosure. Rejeitado: reconciliar o `ui/accordion` (violaria `/ui` intocado) e reimplementar motion do zero.
2. **`multiple` no wrapper, não no primitive** — o `Collapsible` é single por natureza; a lista de `openValues` vive no `Accordion` (array), então `multiple` é só "permitir mais de um na lista". Rejeitado: estender o primitive.
3. **Chevron via `data-state` do radix** — `[&[data-state=open]>svg]:rotate-180` no trigger (padrão shadcn); sem contexto extra para rotação. Rejeitado: contexto só para o ícone.
4. **`keepRendered` exposto no Content** — já existe no `Collapsible`; expor preserva o estado do painel quando fechado (pedido do DEMO upstream). Rejeitado: esconder a prop.
5. **`24 Collapsible` `pending`** — decisão do dono; a validação ocorre no fluxo normal, mesmo estando em produção.
6. **Reveal `mask` por padrão no accordion** — investigação no registry do upstream (`primitives-base-accordion`): o efeito "bonito" do site vem de uma **máscara CSS animada** (`--mask-stop` 0%→100% em `maskImage: linear-gradient(black var(…), transparent var(…))`) somada ao `y: 20`. Sem a máscara, o painel translúcido desenha texto **sobre** a linha separadora (o defeito relatado pelo dono no `slide` puro). Decisão: portar a máscara como reveal `mask` (default do accordion) e manter `depth` (3D) como alternativa; `slide` continua o default do `Collapsible` (upstream radix collapsible não tem máscara e a sidebar fica intocada). Rejeitado: aplicar a máscara no collapsible (mudaria a sidebar já aprovada).
7. **Spring `150/22` no painel** — mesmo default do componente upstream (`components/base/accordion`); `transition` continua sobrescrevível.
8. **`onHover` no `Collapsible` e no `Accordion`** (pedido do dono) — implementação única no `Collapsible`: handlers `mouseenter`/`mouseleave` sempre ligados no root (o "item" inteiro, então entrar no painel não fecha) e o efeito gated por `onHover` (default `false` = comportamento anterior byte a byte; handlers do chamador compostos, sem clobber). O `Accordion` carrega a flag no contexto e repassa por item. Clique/teclado/touch permanecem: hover é gatilho extra, nunca substituto (a11y).
9. **`/ui` vira dívida declarada, não migração** — convergir 1-a-1 criando a versão `custom-ui` na vez de cada item; nada é editado em `/ui`.

## Risks / Trade-offs

- [Dois accordions no repo (`ui` base + `custom-ui` novo)] → intencional: a base fica como referência shadcn; só o `custom-ui` é consumido. O teste do `ui-catalog` continua cobrindo a base.
- [`switch`/`avatar` têm consumidor de produção em `/ui`] → registrado como prioridade na dívida (§14); convergem quando o item correspondente for validado.
- [Prova do 02 muda de comportamento na validação] → é o objetivo (fechar animado); o dono revalida o card.
