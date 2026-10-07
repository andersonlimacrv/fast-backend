# custom-ui-subscription-calendar — design

## Context

Último doc não portado (item 18, deferido no §9 por "billing avançado"). Duas variantes no doc: `-base` (tokens) e a "final" (zinc fixo, o padrão que o §12 já registra). O bloco tem 4 estados interativos (seleção de dia, quick add, busca, resumo) + o spinner do exportar, e usa ícones de `lucide-react` e `react-icons/tb`.

## Goals / Non-Goals

Goals: estrutura e motion da registry com 100% das cores em tokens do `index.css`; provado no lab; fila de portes zerada. Non-goals: tons laranja/roxo/amarelo literais, export real em CSV, uso em produção.

## Decisions

1. **Fonte = registry Watermelon, esquema de cores nosso** — o dono apontou o componente ao vivo (`ui.watermelon.sh/animated-components/subscription-calendar`, registry buscada em 2026-09-23) e depois pediu o esquema do projeto em vez dos tons laranja: a estrutura/motion da registry ficam, mas **toda cor vira token do `index.css`** — e os acentos seguem a regra do fill cheio (dono: é transparência, não cor): Total e badge do add em `bg-primary` cheio com `text-primary-foreground` (9.11:1, o par validado), em vez de tints. Um token `--accent-strong` chegou a ser criado para isso e foi removido na mesma sessão. Rejeitado: manter o laranja como marca e escurecer o matiz em vez de encher o fill.
2. **Cantos pelos tokens** — regra do dono (2026-09-23, "as bordas sempre devem vir do estilo atual… variáveis do index.css"): `rounded-xl` (`var(--radius-xl)`) no card e nos overlays, em vez de `rounded-3xl` (24px default do Tailwind, fora da nossa escala) e do `rounded-[23px]` do doc. O `rounded-full` dos pills/botões fica (é a forma, não a escala).
3. **`layoutId` escopado** — o glow do dia ativo usa `layoutId={`${useId()}-active-glow`}`: o doc hardcoda `activeGlow`, e duas instâncias na mesma página fariam o glow "voar" entre calendários. Delta invisível no uso único, correto no reuso.
4. **Shell dos overlays como subcomponente local** — os três overlays repetem o mesmo bloco no doc (absolute inset-0, blur, X, badge, título, transição); um `Overlay` local DRY mantém o visual idêntico e o arquivo legível. Rejeitado: copiar 3× (o doc faz, mas é ruído).
5. **`xs:` → `sm:`** — o tema não define breakpoint `xs`, então no doc as classes `xs:*` são inertes no nosso build (o chip "Today" ficaria sempre `hidden`); o porte mapeia para `sm:` (visível a partir de 640px) — intenção original preservada.
6. **Press-only no "+"** — o doc tem `hover:scale-105 active:scale-95`; a casa já decidiu duas vezes (Checkbox, CopyButton) que crescimento no hover é poluído — fica só o press. Os dias mantêm `whileTap 0.95` (é o feedback do doc).
7. **A11y** — botões de ícone com `aria-label` ("Previous month", "Next month", "Add subscription", "Search subscriptions", "Export calendar", "Monthly summary", "Close"), dias com `aria-pressed` + `aria-label` ("Day N"), `ring-2` de foco (§8), ícones decorativos `aria-hidden`, `amenity`: inputs do overlay com `aria-label`.
8. **Timer do exportar limpo no unmount** — o doc deixa o `setTimeout` solto; aqui ele é rastreado e limpo (padrão do CopyButton).
9. **Ícones pela fonte única** — `TbCube` adicionado ao `lib/icons.tsx` (pack `tb` já era usado por `TbClockHour12Filled`); o `Loader2` do doc é o `LoaderCircle` do lucide atual (já exportado); o resto já existia. A prova usa **iniciais coloridas** como logos (nenhuma lib de marca nova).
10. **Hover sutil nos dias** — dono, 2026-09-23: o `hover:border-input` do doc era **morto** (`--input` e `--border` têm o mesmo valor desde o `design-contrast-borders`), então os dias ganharam `hover:border-muted-foreground/20` (1.92:1 light · 1.25:1 dark contra a borda atual — ainda mais sutil, a pedido).
11. **Dia selecionado em primary, fundo `/60`** — dono, 2026-09-23 ("no primary da cor de fundo, coloque `/60`"): `border-primary` sólida + `border-2` (1px → 2px) sobre `bg-primary/60`, com o número em `text-primary-foreground` (10.97:1 light · 5.8:1 dark, sem mexer no número). Rejeitado: manter o rim translúcido (sumia no light).

## Risks / Trade-offs

- [Acentos legíveis nos dois temas] (dono, 2026-09-23): em vez de tints (`bg-primary/10` = 1.46:1 no light), Total e badge do add são `bg-primary` cheio com `text-primary-foreground` (**9.11:1**, o par validado do Checkbox/Switch) — mesma leitura no light e no dark, sem ramo `dark:`.
- [Bloco grande] → o porte é do doc `-base` inteiro; qualquer ajuste fino (tempos, tamanhos) é validado no lab e fica localizado (constantes `SPRING`/classes).
- [Overlays absolutos] → o card é `relative` e `max-w-105` (o doc ✓); o overlay cobre o card inteiro (não a viewport) — comportamento do doc, mantido.
- [Sem encaixe de produto] → `usedIn: []`; o valor imediato é fechar a fila de portes (resta validação dos que já existem).
