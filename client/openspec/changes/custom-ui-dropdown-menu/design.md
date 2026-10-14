# custom-ui-dropdown-menu — design

## Context

O item 10 é o único pending que **já tem o componente pronto**: o pacote radix vendored (`custom-ui/components/dropdown-menu/dropdown-menu.tsx` + `primitive.tsx`) entrou a pedido do dono em 2026-09-16 (change `sidebar-demo` S7.5, exceção à regra "não adicionar Radix novo" registrada no §11) e substituiu o `ui/dropdown-menu.tsx` Base-UI (deletado — um sistema só). A sidebar o usa em 6 pontos (org switcher, Projects rail/actions, user menu) e desde 2026-09-23 os menus do card 07 também.

O que falta é a **prova própria** do item: o Trials não tem demo, então o card 10 só mostra "No live proof yet — ported, awaiting a proof", e a superfície composta do doc (checkbox/radio/sub/disabled/destructive/placements) não é exercitada em lugar nenhum além do teste básico de abrir/fechar.

## Goals / Non-Goals

Goals: prova viva fiel ao doc + testes da superfície composta; validar e mover o item para a Gallery. Non-goals: editar o pacote, migrar consumidores, criar variantes.

## Decisions

1. **Prova = demo do doc + placement do shell** — o demo upstream é um menu único com toda a superfície; a sidebar usa placements específicos (`side="right"` nos itens do rail, `side="top" align="end"` no rodapé). A demo mostra os dois eixos: superfície completa (default `side="bottom"`) + o rodapé (`side="top" align="end"`), sem inventar variantes.
2. **Sem ícones na demo** — o demo do doc é texto + `Shortcut` (sem ícones); manter fiel evita import novo e mantém o contraste com os menus da sidebar (que têm ícones próprios).
3. **Sem tocar no pacote** — o contrato vendored está congelado desde 2026-09-16; a prova só consome (e é o gatilho para validar o item, como manda a fila).
4. **Testes por papel, não por pixel** — `menuitemcheckbox`/`menuitemradio`/sub-menu cobertos por asserções de papel + callback; o highlight animado (`Highlight`) e os placements ficam para a validação visual (jsdom não mede posição).
5. **Nota do catálogo atualizada** — o consumo pelo card 07 entra como evidência (não validação), como já registrado; a validação acontece nesta prova.

## Risks / Trade-offs

- [Sub-menu em jsdom] → Radix abre por hover/`ArrowRight`; o teste usa o caminho de teclado (determinístico). Confirmado: funciona; o hover não é testável sem ponteiro real.
- [Menu modal + trigger `aria-hidden`] → com o menu **modal** o trigger sai da árvore de acessibilidade enquanto aberto (o primeiro teste do checkbox/radio falhou exatamente aí); os casos usam `modal={false}` (como o shell) ou selecionam dentro do próprio menu. Fica registrado para futuros testes de menu.
- [Item 10 já em produção] → a prova não muda comportamento nenhum (só demo/testes); o risco é zero para o shell.
