# custom-ui-switch — design

## Context

O item 19 (`SwitchModeToggle`) foi portado como `components/theme-toggle.tsx` — pill sol/lua com knob que desliza por spring. Na validação do card 07 apareceu (a) a falta de um switch **reutilizável** (há três implementações diferentes no app) e (b) o problema de contraste do verde no light, medido: `--primary` como preenchimento sobre fundo claro dá 1.19:1 (barra) / 1.51:1 (card) / 1.43:1 (knob do toggle), contra 11:1 no dark; `--ring = --primary` deixa o foco em light também em 1.51:1.

O dono decidiu a ordem: **extrair o base primeiro**; contraste depois — em 2026-09-23 o base foi aprovado com fundo verde no ativo, a opacidade foi suavizada (`primary/60`) e as camadas de contorno entraram (change `design-contrast-borders`).

## Goals / Non-Goals

Goals: um `Switch` reutilizável em `custom-ui`, com a mecânica do `SwitchModeToggle`, catalogado e provado. Non-goals: adotá-lo no `theme-toggle`, mudar tokens, convergir Grants/card, editar `/ui`.

## Decisions

1. **Extrair a mecânica, não o sol/lua** — o base recebe `startContent`/`endContent` (slots) e aplica a regra da referência: o lado onde o knob está lê como ativo (`text-foreground`), o outro fica `text-muted-foreground`. Ícones são do consumidor. Rejeitado: hardcodar Sun/Moon no base (deixaria de ser reutilizável).
2. **Cores pela linguagem do Checkbox validado** — decisão do dono (2026-09-19) depois da primeira versão com as cores antigas: **ativo = trilho `bg-primary` (fundo verde cheio)**, knob como marca clara (`bg-background`), e os conteúdos coloridos pelo que está **embaixo** deles — o ícone do lado ativo fica sobre o knob (`text-foreground`) e o do lado inativo sobre o verde (`text-primary-foreground`), preservando o par 9.11:1 do Checkbox; **inativo = `bg-background` + borda** (como a caixa desmarcada); `transition-colors duration-500` como o Checkbox. A tentativa intermediária de suavizar com `bg-primary/60` foi **revertida pelo dono (2026-09-23)**: "o fundo fica cheio; a suavidade fica nas bordas" — o fill nunca é atenuado, quem carrega a delicadeza é a camada de contorno. Rejeitado: knob claro sobre o verde puro sem borda (1.51:1, some no trilho — resolvido justamente pelo rim).
3. **Camada de contorno** (`design-contrast-borders`, dono 2026-09-23) — cada estado com o **mesmo alpha no trilho e no knob**, calibrado pelo próprio dono na validação: ON `border-primary-foreground/30` e OFF `border-border/50` (mais suaves que o 3:1 geral — decisão estética explícita), com o fundo sempre cheio, para o verde e o knob terem aresta sobre fundo claro; acompanha a regra nova do `DESIGN.md` §4.5 (base `/80`, que segue no checkbox/card) e os tokens do light (`--border`/`--input` 3.12:1, `--ring` 4.92:1). Rejeitado: resolver só com token (o verde continuaria sem forma própria) e as hierarquias derivadas (`/72`+`/78`, `border-border/80`) intermediárias — o dono simplificou para alphas iguais por estado.
4. **`theme-toggle` mantém implementação própria** — decisão do dono (2026-09-23), revertendo a refatoração anterior: o controle de tema é **escolha de estado** (sun|moon), não um on/off, e não deve usar primary. O base fica para controles on/off de verdade; o `theme-toggle` volta à versão do HEAD (`bg-muted` no knob, `border-border`, spring próprio) — mesmo comportamento, mesmo teste. Rejeitado: manter o consumidor fino (uniformizaria o que é semanticamente diferente).
5. **`useControlledState` do repo** — mesmo padrão do `Collapsible`/`AlertDialog`/`CopyButton`; `defaultChecked ?? false` garante `aria-checked` definido no modo não controlado (pegadinha encontrada no teste).
6. **Tipo = `HTMLMotionProps<"button">`** — `ComponentPropsWithoutRef<"button">` colide com o `onDrag` do motion (o handler nativo vs o gesto); foi o mesmo tipo de atrito resolvido no `Checkbox`. Rejeitado: `Omit` cirúrgico de `onDrag` (perderia o gesto para quem quiser usar).
7. **Catalogar como n=25** — é um componente nosso, reusável e visível para validação, como o `24 Collapsible`; `ref: SwitchModeToggle.md` porque foi de lá que a mecânica veio; `usedIn: []` até a convergência de Grants (tasks 5.2).

## Risks / Trade-offs

- [O base fica sem consumidor de produção por enquanto] → explícito em `usedIn: []`; a adoção real (Grants, toggle do card) é a etapa "depois" (tasks 5.2).
- [Três switches continuam existindo] → convergir Grants (hoje `ui/switch`) e o toggle do card é a etapa "depois", porque ambos têm desenhos próprios.
- [O knob usa `left`/`right` inline + `layout`] → herda o comportamento do porte atual; se o dono quiser o knob via `x` puro, é ajuste local.
