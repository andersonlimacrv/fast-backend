# billing-card-menus — proposal

## Why

O `CreditUsageCard` (item 07) é o único bloco do lab que **não** usa o sistema de menu do app: o seletor de período ("30 Days") e o menu de reticências ("More actions") são popovers artesanais — `useState` + `document` listeners de clique/Escape + `AnimatePresence` + `motion.div` com `role="listbox"`/`role="menu"` escritos à mão (dono, 2026-09-23: "vamos fazer componentes reutilizáveis nesse bloco"). O pacote **Radix vendored** (`custom-ui/components/dropdown-menu`, o mesmo da sidebar, ao lado de Projects) já resolve foco, teclado, posicionamento, highlight e portal — e o item 10 do catálogo é exatamente esse componente.

## What Changes

- **Novo `client/src/components/billing/credit-usage-card-menus.tsx`** — dois componentes reutilizáveis do bloco:
  - **`UsagePeriodMenu`**: trigger com o período atual + `ChevronDown` (rotaciona quando aberto, via `group-data-[state=open]`); conteúdo `DropdownMenuContent` com **`DropdownMenuRadioGroup`/`DropdownMenuRadioItem`** (semântica correta de escolha única: `menuitemradio` + `aria-checked`, no lugar do `listbox`/`option` artesanal).
  - **`UsageActionsMenu`**: trigger `MoreVertical` (`aria-label="More actions"`) com `side="top" align="start"` (abre para cima, como no card atual) e itens data-driven (`label`, `icon`, `onSelect`, `disabled`).
  - Ambos `modal={false}`, como os menus da sidebar (não prendem foco nem brigam com o Sheet mobile).
- **`credit-usage-card.tsx` enxuga**: saem `activePopover`, `moreRef`, `periodRef`, os listeners de `document`, os dois `AnimatePresence`/`motion.div` e os anims `popoverAnim`/`instantAnim`; entram `<UsagePeriodMenu>` e `<UsageActionsMenu>` mantendo `PERIOD_OPTIONS`, `selectedPeriod`, `moreOptions` (Export CSV, Print history, Share report, Refresh data) e o comportamento de fechar ao selecionar.
- **Testes**: o `describe("credit-usage-card")` ganha a abertura/seleção do período e a abertura/execução do menu de ações (mesma sequência de ponteiro dos testes do dropdown-menu).
- **Docs**: nota do 07 no `entries.ts`, `review-design` §13, CHANGELOG e a nota do item 10 (que passa a ser consumido também pelo card — reforço de evidência, sem validá-lo).

## Capabilities

### New Capabilities

- Nenhuma.

### Modified Capabilities

- `lab-harness`: item 07 com menus reutilizáveis (bloco deixa de ter popover próprio).

## Impact

- Novos: `client/src/components/billing/credit-usage-card-menus.tsx`, change `billing-card-menus`.
- Alterados: `client/src/components/billing/credit-usage-card.tsx`, `ui-catalog.test.tsx`, `client/src/lib/catalog/entries.ts` (07/10), `docs/review-design.md` §13, `CHANGELOG.md`.
- **Intocados**: o pacote `custom-ui/components/dropdown-menu/**` (só consumido), tokens e os demais itens do catálogo.

## Non-goals

Validar o item 10 (a validação dele é na prova própria, com o dono); criar um "menu genérico" novo em `custom-ui` (o pacote já é isso); mudar os dados/labels do card.

## Acceptance criteria

1. `/admin/lab/trials` → card `07`: o seletor de período abre o menu do pacote (não o popover antigo), mostra as 5 opções como `menuitemradio`, marca a selecionada e fecha ao escolher, atualizando o trigger.
2. As reticências abrem para cima com Export CSV, Print history, Share report e Refresh data; Export dispara o download e a animação; Esc/clique fora fecham.
3. Teclado: setas navegam, Enter seleciona, Esc fecha e o foco volta ao trigger.
4. Gates: `tsc`, `oxlint`, catálogo e build verdes.
