# gallery-bento — design

Proposta `ui-designer` (sessão `ses_ec8cbac02ffeOvjQUb3QTJxsMp`), a partir de
`docs/DESIGN.md` §§3/4/6/7/8. Só `Gallery.tsx` muda.

## Grid

Seção = `@container`; cards em `grid grid-cols-1 gap-4 items-start
grid-flow-dense @[44rem]:grid-cols-2 @[76rem]:grid-cols-3` (mobile-first §6;
limiares de container — não viewport — porque drawer/rail/expanded mudam a
largura; `gap-4`/`gap-8` da escala §4.4). `items-start` impede tile alto de
esticar vizinhos; `grid-flow-dense` preenche sobras sem mudar ordem DOM.

## Spans (por largura intrínseca do demo, não por kind)

- R1 default 1 col; R2 span-2 em container ≥2 col só para `accordion`,
  `collapsible`, `credit-usage-card`, `expand-details`, `tabs`,
  `animated-circular-progress-bar`, `subsription-calendar`,
  `404-page-not-found`; R3 nunca span-3/row-span (sem masonry — quebra
  leitura); R4 anti-buraco via dense-flow (ragged final aceito, buraco
  no meio não).

## Wrappers e header

`min-w-0` universal anti-blowout; `grid justify-items-center` para
`credit-usage-card`, `tabs`, `inputs`, `sidebar` (teto `max-w-*` centraliza).
Header: título `text-sm`, sem `StatusBadge`, `UsageList` intacto, `p-4/pb-2`
e `p-4/pt-0`. Sem coreografia de entrada (§3.3), sem token novo, ARIA/teclado
e `ring-2` intactos.

## Redistribuição (dono, follow-up)

Branco residual era estrutural: a linha do grid tem a altura do tile mais
alto e `items-start` deixava o fundo da página à mostra sob os tiles baixos
(`accordion`/`avatar`/`gooey` dividindo linha com `run-action-button`/
`switch-mode-toggle`/`radio`); dense-flow só fecha buraco de coluna, nunca
de altura. Fix: `items-stretch` + card `h-full flex flex-col` + conteúdo
`flex-1 justify-center`. Rejeitados: reordenar por altura (quebra a ordem `n`
Lab↔Gallery), masonry `columns-*` (ordem visual ≠ DOM, regressão §8),
enxugar demos (registry compartilhado com Lab/testes).
