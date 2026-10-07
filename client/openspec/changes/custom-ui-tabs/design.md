# custom-ui-tabs — design

## Context

O item 20 usa um porte próprio em `/ui/tabs.tsx` (Base UI + `Tabs.Indicator` nativo + `TabsPanels` com ResizeObserver que não keya pelo value — o comentário no código admite: o value vive no contexto interno do Base UI, fora da API pública). O dono pediu exatamente o **`primitives/base/tabs`** (`https://animate-ui.com/docs/primitives/base/tabs`), com precedência dos moldes do projeto, e **deleção total do outro** para não haver conflito depois (2026-09-30).

## Goals / Non-Goals

Goals: o primitivo pedido (pill Highlight + blur nos painéis + auto-height), com nosso layout, provado nos dois modes. Non-goals: manter compat com a API antiga (`TabsTrigger` alias, `TabsIndicator`, `TabsContent` alias — prova e testes, únicos consumidores, migram); validar o item (fica `pending` até ok visual + perf).

## Decisions

1. **Vendored fiel, import local** — o upstream importa `@base-ui-components/react/tabs`; o instalado é `@base-ui/react@1.8.0` (mesma API: `Root/List/Tab/Panel` com `render` + `keepMounted`, verificado nos `.d.ts`). Rejeitado: instalar o pacote renomeado (duplicata por um alias).
2. **Pasta `tabs/`** — regra do CLIENT-STRUCTURE (2 arquivos: `primitive.tsx` comportamento + `tabs.tsx` estilizado), precedente do toggle-group.
3. **Auto-height com nosso molde** — o doc usa o efeito `AutoHeight` (que puxaria `Slot` + `use-auto-height`, inexistentes aqui). Nosso `/ui` já media com ResizeObserver; o vendored `Tabs` expõe `useTabs().value`, então o novo `TabsPanels` keya o fragmento pelo value — resolve a limitação do antigo sem arquivo novo. Modo `layout` verbatim do doc. Rejeitado: vendorizar 3 arquivos para um efeito que já temos em casa.
4. **Sem hover no tab** — lição do toggle-group (2026-09-30): o demo deixa os tabs nus; só o Highlight pinta seleção. `ring-2` de foco (§8) e `disabled:` ficam (casa). **Armadilha `data-[disabled]`** (achada no browser, 2026-09-30): o Base UI renderiza `data-disabled="false"` sempre, e o variant bare `data-[disabled]` do Tailwind casa por presença do atributo — `data-[disabled]:pointer-events-none` matava o clique em **todas** as tabs (e `opacity-50` apagava tudo). Só `:disabled` nativo. Rejeitado: qualquer `data-[disabled]:` com efeito comportamental.
5. **Highlight default `bg-background` + sombra** — no demo o pill é claro sobre a lista `bg-accent`; aqui a lista é `bg-muted` (nosso molde), então o pill segue o mesmo contraste (claro sobre muted) com os cantos do tema.
6. **Deleção total, sem alias** — `TabsTrigger`→`TabsTab`, `TabsContent`→`TabsPanel`, `TabsIndicator` morre (o pill do Highlight o substitui). Rejeitado: re-exportar aliases (dualidade que o dono vetou).
7. **Testes por papel Base UI** — troca de value, setas (roving), pill (`data-slot="motion-highlight"`), painel trocando; jsdom não mede o slide/blur, que ficam para o lab + perf com dados reais.

## Risks / Trade-offs

- [`render` no Panel] → suportado em 1.8.0 (tipos conferidos); se o blur não animar em algum browser, o fallback é painel seco (conteúdo intacto).
- [ResizeObserver no jsdom] → guard `typeof ResizeObserver === "undefined"` herdado do molde (altura `auto` nos testes).
- [Prova antiga some] → intencional: account/quota com `Indicator` era o porte errado.
