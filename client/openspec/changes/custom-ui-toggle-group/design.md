# custom-ui-toggle-group — design

## Context

O item 21 usa um porte próprio em `/ui/toggle-group.tsx` (Base-UI + cva default/outline × 4 tamanhos + contexto de variante — dívida §14) que ninguém em produção consome; a prova usa `ToggleItem` com um array sem `type`. O dono pediu o **`primitives/radix/toggle-group`** (`https://animate-ui.com/docs/primitives/radix/toggle-group`) com nosso layout e nossas diretrizes.

## Goals / Non-Goals

Goals: o primitivo pedido, com o Highlight deslizante e nosso layout, provado single+multiple. Non-goals: compat com a API antiga, validar o item (fica `pending`).

## Decisions

1. **Primitivo Radix, não Base-UI** — o upstream é Radix (`ToggleGroup as ToggleGroupPrimitive from 'radix-ui'`, pacote já instalado e usado pelo dropdown vendored); reescrevê-lo sobre Base-UI seria portar duas vezes. Rejeitado: manter o `/ui` (é a dívida que o dono mandou quitar).
2. **Pasta `toggle-group/`** — regra do CLIENT-STRUCTURE (2 arquivos: `primitive.tsx` comportamento + `toggle-group.tsx` estilizado), precedente do dropdown-menu e do files.
3. **Composto mínimo, sem cva** — o upstream não tem variantes; nada no app usa as do `/ui` (só prova+testes, que migram). O composto define container, item (layout + foco + disabled + svg) e o Highlight default (`bg-accent rounded-md`, sobrescrevível); a seleção é pintada **só** pelo Highlight (sem `data-[pressed]:bg-*` duplicado). Rejeitado: carregar o cva junto (peso sem consumidor).
4. **Nomes upstream, sem alias** — `ToggleGroupItem` (doc + item); o `ToggleItem` do `/ui` morre com a migração da prova e dos testes (únicos consumidores).
5. **Reduced-motion em duas camadas** — o `Highlight` do pacote já zera a transição sozinho; o `whileTap` do item ganha guard local (único delta comportamental no primitive).
6. **Testes por papel Radix** — `type="single"` com string, `type="multiple"` com array (corrige o quirk da prova antiga), roving tabindex por setas e presença do pill (`data-slot="motion-highlight"`); jsdom não mede o slide, que fica para o lab.
7. **Sem hover próprio no item** (dono, 2026-09-30) — o demo upstream deixa os itens nus (`size-8`, sem hover): a seleção é pintada **só** pelo Highlight. Nosso `hover:bg-accent` fazia o item não-selecionado imitar o selecionado no hover. Rejeitado: qualquer fill fora do Highlight. O `rounded-md` fica nos dois (item + pill) para casarem; no multiple cada `ToggleGroupHighlightItem` leva `bg-accent rounded-md` como no doc (sem isso o overlay é transparente).

## Risks / Trade-offs

- [Sem variantes de tamanho] → se um dia a app pedir `sm`/`lg`, o cva volta como delta documentado (hoje seria peso morto).
- [`useControlledState` com cast] → mesmo padrão dos outros primitivos (Radix entrega `eventDetails` a mais; o contexto guarda a forma simples).
- [Prova antiga some] → intencional: array sem `type` era semântica inválida no Radix.
