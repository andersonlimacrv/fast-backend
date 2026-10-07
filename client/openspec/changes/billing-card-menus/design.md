# billing-card-menus — design

## Context

O card 07 (validado em comportamento, aguardando veredito) tem dois popovers artesanais: período (`role="listbox"`, `Check` na opção, `w-36`) e ações (`role="menu"`, `w-44`, abre para cima). O dono pediu componentes reutilizáveis nesse bloco e lembrou que o app já tem o menu Radix vendored usado na sidebar (ao lado de Projects, item 10 do catálogo).

O pacote `custom-ui/components/dropdown-menu` já define: portal com `AnimatePresence`, `Highlight` no content, `dropdown-menu.tsx` com `sideOffset` default 4, itens com `gap-2 rounded-sm px-2 py-1.5 text-sm`, `CheckboxItem`/`RadioItem` com indicador animado (check / dot), `Shortcut`, e o padrão `modal={false}` que a sidebar adotou (documentado em `app-sidebar.tsx`).

## Goals / Non-Goals

Goals: componentes reutilizáveis do bloco, um sistema de menu só, sem popover artesanal. Non-goals: novo genérico em `custom-ui`, validar o 10, mudar dados.

## Decisions

1. **Reusar o pacote da sidebar** (não criar menu novo) — um sistema só, o mesmo que o item 10 cataloga; ganha foco/teclado/posição/portal de graça. Rejeitado: manter os popovers (a dívida que o dono apontou).
2. **Arquivo em `components/billing/`** (`credit-usage-card-menus.tsx`) — os componentes são do bloco (período/uso), não primitivos genéricos; `custom-ui` é para componentes visuais de página. Rejeitado: subcomponentes privados dentro do card (não seriam reutilizáveis, que é o pedido).
3. **Período com `DropdownMenuRadioGroup`/`RadioItem`** — a semântica correta para escolha única num menu é `menuitemradio` + `aria-checked` (o `listbox` artesanal não tinha teclado/clique-fora/posição). Deltas visuais aceitos e registrados: indicador vira o dot (`CircleDot`) do pacote, à esquerda, e os itens ganham o espaçamento/tipografia padrão dos menus do app (`text-sm`, `px-2 py-1.5`) — consistência com a sidebar. Rejeitado: `DropdownMenuCheckboxItem` (semântica de múltipla escolha) e `role="menuitemradio"` na mão sobre `DropdownMenuItem` (reinventaria o pacote).
4. **Ações data-driven** (`{label, icon, onSelect, disabled}[]`) — o card continua dono dos labels/ícones/handlers (Export CSV chama `handleDownload`, etc.); o componente cuida de trigger/conteúdo/posição. `side="top"` porque o menu nasce no rodapé do card (o popover antigo abria com `bottom-full mb-2`). Rejeitado: hardcodar os 4 itens no menu (deixaria de ser reutilizável).
5. **`modal={false}`** — mesmo racional da sidebar (menus não-modais; sem `aria-hidden` no resto da página e sem travar o Sheet).
6. **Card perde a máquina manual** — saem estado `activePopover`, refs, listeners de `document` e anims; ficam `selectedPeriod`, `PERIOD_OPTIONS`, `moreOptions`, `downloadDone`/timer e a animação do download. O teste do switch do 25 segue intocado.

## Risks / Trade-offs

- [Look dos menus muda] → é a linguagem dos menus do app (sidebar); se o dono preferir o check à direita/`text-xs` do popover antigo, é ajuste de classes num lugar só.
- [Radix abre por sequência de ponteiro] → testes seguem o helper `openMenu` (pointerDown+mouseDown+click) já usado; jsdom cobre abrir/selecionar/fechar.
- [Consumo não valida o item 10] → registrado: a validação do 10 continua na prova própria dele.
