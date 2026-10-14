# design-contrast-borders — design

## Context

O tema tweakcn usa `--primary` como lima clara. Isso funciona como **superfície** (com `primary-foreground` escuro por cima: 9.11:1) mas não como **forma**: medição de 2026-09-19 (`review-design` §15) dá 1.19–1.51:1 para os preenchimentos no light, e `--ring = --primary` deixa todo foco em light a 1.51:1. O `--border`/`--input` do light estava em 2.39:1, abaixo dos 3:1 de WCAG 1.4.11 para contornos de UI.

O dono (2026-09-23) decidiu: **mais camadas de contorno, principalmente no light**, em duas camadas (tokens + componentes), intensidade equilibrada.

## Goals / Non-Goals

Goals: contornos e foco visíveis no light sem redesenhar o tema; uma regra explícita no `DESIGN.md` para preenchimentos coloridos. Non-goals: mexer no dark; trocar `--primary`; convergir componentes de produção (Grants/card) — fica como follow-up.

## Decisions

1. **Tokens do light, não do dark** — `--border`/`--input` vão para L 0.66 (**3.12:1** vs branco, primeiro degrau acima do mínimo) e `--ring` passa a `--chart-3` (**4.92:1**, o verde escuro que já existia no tema). O dark já estava adequado (`--border` 0.3195, ring 11:1) e não é tocado — menos risco de regressão onde nada estava quebrado. Rejeitado: L 0.62 (3.65:1, marcado demais para o visual atual) e clarear o dark.
2. **`--ring` = `--chart-3`, não um cinza novo** — reaproveita um token existente, mantém a identidade verde no foco e evita inventar mais um valor no tema; `--chart-2` (3.31:1) ficaria no limite e menos harmônico com o verde do `--primary`.
3. **Regra por camada no preenchimento, não "usar `--chart-*`"** — a proposta antiga era "preenchimento no light usa `--chart-2…5`", mas isso mudaria a cor do produto (verde lima → verde escuro) em tudo que já foi validado (checkbox, switch). A camada de contorno (`border-*-foreground/80`) preserva a cor validada e só adiciona a aresta que faltava. O `--chart-2…5` continua a saída para indicadores finos sem contorno.
4. **Um tom para o contorno: o do conteúdo** (`*-foreground/80`) — em vez de inventar um "primary-border", o contorno deriva do par que o componente já usa, então acompanha qualquer tema/troca de cor e mantém o padrão `superfície + conteúdo + aresta` do Checkbox validado. **No `Switch` o dono calibrou os alphas na validação** (2026-09-23) e simplificou as hierarquias derivadas que eu havia proposto (`/72`+`/78` no ativo, `border-border/80` no off): cada estado usa o **mesmo alpha no trilho e no knob** — `primary-foreground/30` (ON) e `border-border/50` (OFF) — abaixo do 3:1 geral por decisão estética; fora do Switch a base `/80` segue (checkbox/card). O **fundo** do Switch fica **cheio** (`bg-primary`): a suavidade mora nas bordas, nunca no fill (a tentativa de `bg-primary/60` foi revertida pelo dono).
5. **Aplicar nos 3 itens em validação** (switch, checkbox, segmentos do card) — são os que têm preenchimento colorido no lab; `theme-toggle` fica fora porque não usa primary.
6. **Sem mudança de comportamento/teste** — é cor + token: nenhum teste novo, o catálogo (35/35) e o e2e cobrem a existência dos nós/roles.

## Risks / Trade-offs

- [Bordas mais escuras em todo o app no light] → é o pedido; o degrau escolhido (0.66 → 3.12:1) é o mínimo que passa, não o máximo; rolar as páginas no light é o teste de aceitação.
- [Contorno com alpha sobre fills com alpha] → a composição de `primary-foreground/80` sobre `primary/60` sobre branco foi medida (~10.97:1 para o conteúdo contra o trilho ativo no light, 5.80:1 no dark); a aresta é aditiva e não piora nenhum par existente.
- [Foco mais escuro pode "pesar" visualmente] → era 1.51:1 (invisível); o novo ring é o `--chart-3`, o mesmo verde usado nos gráficos.
