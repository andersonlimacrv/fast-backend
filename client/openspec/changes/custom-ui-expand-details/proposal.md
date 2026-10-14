# custom-ui-expand-details — proposal

## Why

O item 11 (`ExpandDetails.md`) é um dos dois que faltam **portar** (o 18 é o outro): `source: null`, deferido no §9 ("sem encaixe definido") e com o §7 registrando a **dependência fantasma** — o doc importa `react-use-measure` sem listar no bloco de install. O dono decidiu portar agora (2026-09-23) para validar no lab.

O doc traz duas variantes do mesmo bloco: a `-base` (tokens: `bg-card`, `border-border`, `text-card-foreground`) e a "final" (com `zinc` fixo, `h-screen` e um typo `btransition-colors`) — o §12 já registra que as variantes de referência trazem `zinc` fixo e hex.

## What Changes

- **Novo `custom-ui/components/expand-details.tsx`** (`block`) — porte token-first do bloco:
  - coreografia do doc com **os cantos deixados de fora** (dono, 2026-09-23): o card anima `width` (320↔120) e `height` (medido do conteúdo) no spring `200/22/1.2`, com os delays invertidos (width espera o collapse, height espera o expand: `0/0.3s` e `0.25/0`); chevron rotaciona `-90°` (0.2s, delay 0.3s) e o painel entra/sai com **blur 8px + y** (spring 0.4s, `popLayout`, delay 0.3s). O `borderRadius` 20↔24 do doc (morph aberto→pill) foi **removido**: o card é só uma div que alterna tamanho e os cantos vêm do tema via `rounded-xl` (resolve `var(--radius-xl)` do `index.css`, 4px hoje) — sem raio hardcoded e sem JS;
  - **sem `react-use-measure`**: a medição vira um `ResizeObserver` local (com fallback `height: auto` e guard para ambientes sem RO, como jsdom);
  - **tokens** em vez de `zinc` (a variante `-base` do próprio doc já usava) + `ring-2` de foco (DESIGN.md §8) + `aria-expanded` no botão;
  - conteúdo **data-driven** (`title`, `items`) com o default do doc (Model/Tokens/Cost/Latency/Temperature) e `defaultOpen`, `expandedWidth`, `collapsedWidth`, `className`; o wrapper `h-screen` do demo fica fora do componente (a prova centraliza);
  - reduced-motion colapsa toda a animação.
- **Prova no lab** (`catalog-demos.tsx`): o bloco default (aberto) + um segundo exemplo data-driven (`title="Run"`, 3 itens, `defaultOpen={false}`).
- **Testes**: abre por padrão (`aria-expanded`), colapsa no clique com o painel saindo pelo `AnimatePresence`, e `defaultOpen={false}` + `items` custom.
- **Docs**: `entries.ts` n=11 (`source` + nota), `review-design` §13 (linha 11) e §9 (deferimento resolvido), CHANGELOG.

## Capabilities

### New Capabilities

- Nenhuma.

### Modified Capabilities

- `lab-harness`: item 11 portado e provado (fila dos "não portados" cai para um: o 18).

## Impact

- Novos: `client/src/components/custom-ui/components/expand-details.tsx`, change `custom-ui-expand-details`.
- Alterados: `client/src/components/catalog-demos.tsx`, `ui-catalog.test.tsx`, `client/src/lib/catalog/entries.ts`, `docs/review-design.md` §9/§13, `CHANGELOG.md`.
- **Intocados**: `package.json` (nenhuma dependência nova — o porte elimina a fantasma), tokens, páginas.

## Non-goals

Instalar `react-use-measure`; portar a variante `zinc`/`h-screen` do demo; usar o bloco em produção (não há encaixe definido — segue como bloco de catálogo até aparecer caso real).

## Acceptance criteria

1. `/admin/lab/trials` → card `11 ExpandDetails`: o card abre em 320px e, ao clicar, colapsa para ~120px encolhendo a altura em seguida; reabrir cresce a largura primeiro e a altura depois, com o painel entrando em blur + y e o chevron girando — **com os cantos fixos do tema** (sem morph de raio/pill).
2. Conteúdo default (5 campos, "Model" ocupando as duas colunas) e o exemplo custom (`Run`, 3 itens) renderizam certo.
3. Teclado: o botão é focável com `ring-2`, `aria-expanded` acompanha.
4. Reduced motion: sem animação (estado final direto).
5. Gates: `tsc`, `oxlint`, catálogo e build verdes.
