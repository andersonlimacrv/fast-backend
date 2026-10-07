# custom-ui-subscription-calendar — proposal

## Why

O item 18 (`SubsriptionCalendar.md`) é o **último doc não portado** do catálogo (`source: null`, deferido no §9 por depender de "billing-advanced usage"). O dono validou a fonte ao vivo: o componente é o da **registry Watermelon** (`https://ui.watermelon.sh/animated-components/subscription-calendar`, `registry.watermelon.sh/r/subscription-calendar.json`, buscado em 2026-09-23) — a variante **standalone laranja**, não a `-base` de tokens que o doc congelado também carrega. Decidiu portar como o Watermelon, **com as características do nosso projeto** (tokens, ícones, motion, a11y, raio do tema).

O componente da registry: card `max-w-105` com entrada (`scale 0.96 → 1`, spring `420/28/0.6`), mês/ano com prev/next e ação "+", **três overlays** (`backdrop-blur`) — quick add (form de 3 inputs), busca e resumo mensal —, grade de dias com seleção animada (`layoutId`), logos e indicadores, e footer com legenda, contagens e ações (busca/exportar/resumo) + MONTHLY TOTAL. O dono pediu depois o **esquema de cores do projeto no lugar dos tons laranja**, mantendo o efeito em light e dark.

## What Changes

- **Novo `custom-ui/components/subscription-calendar.tsx`** (`block`) — estrutura e motion da registry Watermelon, **100% nas cores do projeto** (dono: esquema nosso, sem laranja):
  - **mapeamento** (laranja → tokens, regra do fill cheio): o fill `#fa6a2e` vira `bg-primary` (+ `text-primary-foreground`, sem ramo dark — o token adapta); glow do "+" → `shadow-[0_0_15px_color-mix(in_srgb,var(--color-primary)_20%,transparent)]` (mesma forma, matiz nosso); ícone do add e Total → `bg-primary` cheio com `text-primary-foreground` (9.11:1, o par validado — tints apagavam no light); focus dos inputs → `focus-visible:ring-1 focus-visible:ring-ring` (padrão exato do nosso `ui/input.tsx`); badge do resumo → `bg-chart-2/10 text-chart-2`; glow do dia → `border-primary/50 bg-primary/10`; legenda → `chart-2`/`chart-4`; spinner → `text-primary`;
  - **sistema nosso (inalterado)**: superfícies/bordas/textos em tokens, cantos `rounded-xl`, entrada `scale 0.96 → 1` (spring 420/28/0.6), mês `text-[12px] sm:text-[13px]`, chip "Today" `py-0.5`;
  - `layoutId` do glow **escopado com `useId`**; `xs:` → `sm:`; o "+" mantém só o **press**; timer do "exportar" limpo; aria, `ring-2` de foco e reduced-motion.
- **Ícones**: `TbCube` entra no `lib/icons.tsx` (fonte única; o pack `react-icons/tb` já era usado). Demais ícones já existiam (`Loader2` do doc = `LoaderCircle` do lucide atual).
- **Prova no lab** (`catalog-demos.tsx`): dados do demo do doc (mês navegável, dias com indicadores/logos) com logos em **iniciais coloridas** (sem nova lib de ícones).
- **Testes**: render do mês/total, prev/next pelos callbacks, seleção de dia (`aria-pressed`) e os três overlays abrindo/fechando.
- **Docs**: `entries.ts` n=18 (`source` + nota), `review-design` §13 (linha 18) e §9 (deferimento resolvido de vez), CHANGELOG.

## Capabilities

### New Capabilities

- Nenhuma.

### Modified Capabilities

- `lab-harness`: item 18 portado e provado — **fila de portes zerada** (o que resta é validação dos que já têm componente).

## Impact

- Novos: `client/src/components/custom-ui/components/subscription-calendar.tsx`, change `custom-ui-subscription-calendar`.
- Alterados: `client/src/lib/icons.tsx` (`TbCube`), `catalog-demos.tsx`, `ui-catalog.test.tsx`, `entries.ts` (n=18), `review-design` §9/§13, CHANGELOG.
- **Intocados**: `package.json` (nenhuma dep nova — os ícones do doc já têm equivalentes), tokens, páginas.

## Non-goals

Portar a variante `zinc`; trocar o "exportar" por um CSV real (o doc só simula o spinner); usar em produção (segue `usedIn: []` até aparecer o encaixe).

## Acceptance criteria

1. `/admin/lab/trials` → card `18 SubsriptionCalendar`: mês navega (setas), o "+" abre o quick add (3 inputs + Add), a lupa abre a busca, o cubo abre o resumo (Active/New/Total Spend) e o exportar mostra o spinner por ~2s.
2. Dias: clique seleciona com o glow animado; dias muted aparecem mais apagados; indicadores e logos renderizam.
3. Teclado/aria: botões de ícone com `aria-label`, dias com `aria-pressed`, foco `ring-2`.
4. Reduced motion: sem entrada/glow/scale.
5. Gates: `tsc`, `oxlint`, catálogo e build verdes.
