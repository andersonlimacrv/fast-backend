## Why

Item **04 AnimatedCircularProgressBar** da fila do Lab. O componente já vivia em `custom-ui` (sem dívida §14), mas o porte era uma **simplificação** do upstream: um `<circle>` com `strokeDashoffset` e transição de 200ms, sem o **gap de 5%** e sem as duas trilhas em CSS vars — ou seja, não parecia com o componente do magicui. Avaliação do dono (2026-09-19): "está errado, temos que fazer igual".

Além disso faltava o efeito de entrada: no site, o gauge **preenche de 0 até o valor**; aqui nada acontecia ao montar.

## What Changes

- **Reescrever `custom-ui/components/circular-progress.tsx`** como porte fiel do registry `@magicui/animated-circular-progress-bar`:
  - dois `<circle>` (`r=45`, `strokeWidth` configurável) e as CSS vars do upstream (`--circle-size`, `--circumference`, `--percent-to-px`, `--gap-percent: 5`, `--offset-factor`, `--percent-to-deg`), `strokeDasharray: calc(var(--stroke-percent) * var(--percent-to-px)) var(--circumference)`, rotação `-90deg + gap*offset*percentToDeg` e o secundário com `scaleY(-1)` (o gap no topo);
  - secundário renderizado só com `0 ≤ % ≤ 90`, como no upstream.
- **Nova prop `animateOnMount?: boolean` (default `true`)**: a cada montagem o gauge preenche de `min` até `value` em `transitionLength` (default `1000ms`) **com o número contando junto** — um único driver (motion `animate` com a bezier do CSS `ease` `[0.25, 0.1, 0.25, 1]`) para anel e contador não desandarem. `animateOnMount={false}`, `transitionLength ≤ 0` ou `prefers-reduced-motion` caem direto no valor final.
- **Preservado do nosso porte**: `role="progressbar"` + `aria-valuemin/max/now/valuetext` no wrapper (o upstream não tem a11y), `svg`/label `aria-hidden`, cores default por token (`--color-chart-1`/`--color-muted`), `size`, `strokeWidth`, `showValue` (com `%`) e figuras tabulares no número.
- **Prova viva** no registro de demos: loop igual ao demo upstream (0→100 de 10 em 10 a cada 2s), botão **Replay mount** (remonta para rever o preenchimento), gêmeo com `animateOnMount={false}` e variante fina sem label.
- **Testes**: `describe("circular-progress")` ganha primeiro render em `0` (default), `animateOnMount={false}` já no valor e o valor alcançado ao fim do preenchimento.

## Capabilities

### New Capabilities

- Nenhuma (reforça `lab-harness`).

### Modified Capabilities

- `lab-harness`: o item 04 passa a ser um porte fiel com animação de entrada.

## Impact

- Alterados: `client/src/components/custom-ui/components/circular-progress.tsx` (reescrito), `client/src/components/catalog-demos.tsx` (prova), `client/src/components/ui/ui-catalog.test.tsx` (+3 casos), `client/src/lib/catalog/entries.ts` (nota), `docs/review-design.md` §13, `CHANGELOG.md`.
- **Intocados**: `components/ui/**`, backend.

## Non-goals

Editar o registry upstream; portar outros itens; validar pelo dono; mudar tamanho/posição do texto além do já decidido.

## Acceptance criteria

1. Ao montar, `/admin/lab/trials` → card `04`: o gauge preenche de 0 até o valor em 1s, com o número subindo junto, e o gap de 5% aparece entre as duas trilhas (como no site).
2. `Replay mount` refaz o preenchimento; o gêmeo com `animateOnMount={false}` já aparece preenchido.
3. Loop do demo (0→100 de 10 em 10, 2s) atualiza suave, sem saltos.
4. `prefers-reduced-motion` (ou `transitionLength={0}`) mostra o valor final imediatamente.
5. A11y: `role="progressbar"` com `aria-valuenow` no valor real (não no frame da animação).
6. Gates: `tsc`, `oxlint` e o teste do catálogo verdes.
