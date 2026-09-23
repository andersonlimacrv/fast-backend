# review-design — contrastes `references/components_to_use` × `docs/DESIGN.md` × tema atual

> Debate da change `client/openspec/changes/design-unification/` (2026-09-16).
> Hierarquia: `DESIGN.md` vence; tema atual (lima, `radius: 0`) é preservado.
> Decisões do dono marcadas com ✅ (2026-09-16).

## 1. Ícones: `react-icons` espalhado × `lucide` exclusivo

- **Referências** pedem `react-icons/{fa6,ri,bs,tb,hi,io5,fa,bi}` em 5 docs
  (`RunActionButton`, `Tooltip/GooeyMenu`, `FileUpload`, `SubsriptionCalendar`, `404PageNotFound`).
- **`DESIGN.md #9`** + projeto (`components.json iconLibrary:lucide`, 7 arquivos em `src/`,
  zero `react-icons`) = `lucide-react` exclusivo.
- ✅ **Decisão:** as duas libs convivem **só** via `client/src/lib/icons.tsx`
  (re-exports + SVGs locais componentizados — regra de ouro). Redução a uma lib = dívida futura.

## 2. Primitivos: `radix/animate-ui` × Base UI

- `Sidebar.md` cita `radix` (via `shadcn/sidebar`) + wrapper `animate-ui`; demais docs citam
  `@base-ui-components/react` (nome antigo do pacote).
- **`DESIGN.md §2`**: Base UI v1.0 (dez/2025) é o padrão do `shadcn init` desde jul/2026;
  Radix segue suportado mas com ritmo menor pós-WorkOS. Projeto já em `@base-ui/react@1.8.0`.
- **Decisão:** Sidebar reimplementada sobre Base-UI; **não** adicionar `animate-ui`/Radix novo;
  documentar a escolha p/ o agente não misturar `asChild` (Radix) com render props (Base UI).

## 3. Tema: hardcodes × tokens tweakcn

- Variantes de referência trazem `zinc` fixo (`ExpandDetails`) e hex
  (`SwitchModeToggle`, `RunActionButton`) — quebrariam no tema lima/`radius: 0`.
- **Decisão:** reescrever tudo p/ `var(--color-*)` (`bg-card`, `border-border`,
  `text-muted-foreground`, `--radius`, `--primary`). **Cores, radius e chave tweakcn intactos** —
  no máximo espaçamentos finos (`--row-gap`).

## 4. Tipografia: system × `DESIGN.md §4.3`

- Projeto usa system fonts; `DESIGN.md §4.3` pede sans dedicada + mono tabular p/ números.
- ✅ **Decisão:** `Inter Variable` + `JetBrains Mono Variable`
  (`@fontsource-variable/*@5.3.0`, self-hosted) como tokens `--font-sans/--font-mono`.

## 5. Motion: `framer-motion` × `motion/react`

- Alguns docs importam `framer-motion` (nome legado); projeto usa `motion/react` (`motion@13.3.0`).
- **Decisão:** padronizar `motion/react`; micro-interações 120–250ms, GPU (`transform/opacity`),
  `prefers-reduced-motion` sempre. `Inputs.md` declara `motion` sem usar — remover no porte.

## 6. Nomes que mentem: `Tooltip.md` e `DeplymentCard.md`

- `Tooltip.md` **não contém tooltip** — é o `GooeyMenu` (botão com filtro SVG `goo`, debug overlay).
  Tooltip real continua `ui/tooltip.tsx` (Base-UI, existente).
- `DeplymentCard.md` **não é card de deploy** — é duplicata do `RunActionButton`.
- **Decisão:** `GooeyMenu` entra restrito a debug overlay (portado p/ lucide);
  `DeplymentCard` **descartado**.

## 7. Dependências fantasma

| Citado em | Pacote | Veredito |
|---|---|---|
| `ExpandDetails.md` | `react-use-measure` (usado, sem instrução de install) | Fica com a spec futura |
| `SwitchModeToggle.md` | `next-themes` (`useTheme`) | **Não entra** — usa `src/external/theme.ts` + `.dark` existentes |
| `AnimatedCircularProgressBar.md` | `animate-in` (classe) | Checar contra CSS atual (toast usa keyframes próprios); `tw-animate-css` só se necessário |

## 8. Densidade e layout

- Referências ignoram `DESIGN.md §4.4` (`--row-gap` compact/confortável) e `§6`
  (grid + container queries, breakpoints drawer/rail/expandida).
- **Decisão:** aplicar ambos; tabelas mobile colapsam p/ 2–3 colunas + detalhe expansível.

## 9. Deferidos com motivo (não é "não", é "depois")

- **TanStack Table/Query + Recharts/Tremor** ✅ (dono): sem paginação/métricas server-side reais
  hoje — peso morto. Gatilho: primeiro endpoint paginado ou KPI histórico real.
- **`ExpandDetails` / `FileTree` / `SubsriptionCalendar`**: sem encaixe definido (observabilidade,
  explorer, billing avançado). Gatilho: caso de uso + change própria.

## 10. Decisões do code-review (2026-09-16, PR `feat/client-design-unification`)

- **Foco `ring-2` (DESIGN.md §8) em todo arquivo novo/alterado**; `ring-1` legado
  (`button`, `tabs`, `checkbox`…) migra oportunisticamente — consistência imediata
  com o guia, sem churn em arquivos fora do escopo.
- **Exceção `gooey-menu`**: anima `width/height` por exigência do efeito goo
  (bounded 40→200px, spring, `useReducedMotion` + safety net CSS). Um momento
  orquestrado por tela (DESIGN.md §7), não padrão.
- **Drawer `<md`, rail `md–xl`** (correção p/ DESIGN.md §6; tablets de campo usam rail,
  não drawer).
- **`run-action-button`**: step icons via `@/lib/icons` (qualquer das duas libs) **é**
  a regra de ouro; "só `Zap`" vale para o trigger. Sem essa leitura, a regra de ouro
  seria letra morta para os portes vindos do `react-icons`.
- **`CrudPage`/`SettingsTabs` como padrões documentados**, não componentes —
  página admin real (ex.: `AdminOverview`, `Health`) é a prova de composição.

## 11. Adoption ledger — Animate UI (change `animate-ui-adoption`, 2026-09-16)

Fonte: `references/components_to_use/AnimateUi/` (11 docs, CLI+Link+DEMO cada).
Regra: porte manual (sem `npx shadcn add`, sem MCP); `motion@13.3.0` único;
tokens do tema; ícones via `lib/icons.tsx`. Status: ⬜ pendente · 🔄 lane ·
✅ aplicado · ❌ descartado.

| # | Doc (CLI) | Link | Estado | Delta aplicado | Decisão |
|---|---|---|---|---|---|
| 1 | Accordion (`@animate-ui/components-base-accordion`) | /docs/components/base/accordion | ✅ | spring 150/22 + reduced-motion, ring-2 | Lane C |
| 2 | AlertDialog (`…-base-alert-dialog`) | /docs/components/base/alert-dialog | ✅ | spring enter 350/30 + reduced-motion guard | Lane A |
| 3 | Checkbox (`…-base-checkbox`) | /docs/components/base/checkbox | ✅ | variants default/accent + sm/lg, motion `transition` override, ring-2 | Lane B |
| 4 | CopyButton (`…-buttons-copy`) | /docs/components/buttons/copy | ✅ | hoverScale 1.05/tapScale 0.95 + controlled `copied` | Lane B |
| 5 | Dialog (`…-base-dialog`) | /docs/components/base/dialog | ✅ | spring enter 350/30 + reduced-motion guard | Lane A |
| 6 | Radio (`…-base-radio`) | /docs/components/base/radio | ✅ | `transition` override, reduced-motion dot, ring-2 | Lane B |
| 7 | Tabs (`…-base-tabs`) | /docs/components/base/tabs | ✅ | `TabsPanels` + AutoHeight (ResizeObserver, spring 300/30) | Lane A |
| 8 | ToggleGroup (`…-base-toggle-group`) | /docs/components/base/toggle-group | ✅ | group variant/size → context (DEMO Bold/Italic/Underline verbatim) | Lane B |
| 9 | UserAvatar (`…-community-user-presence-avatar`) | /docs/components/community/user-presence-avatar | ✅ | `avatar-group.tsx` novo (overlap, +N, "N online") | Lane C |
| 10 | FileTree→`Files` (`…-base-files`) | /docs/components/base/files | ✅ | `ui/file-tree.tsx` novo (Base-UI accordion, FileIcon, git dots) | Lane C |
| 11 | Sidebar (`…-radix-sidebar`) | /docs/components/radix/sidebar | ✅ | DEMO aplicado sobre Base-UI: org switcher (⌘1-9), subgroups, recentes+`...`, user dropdown, breadcrumb; ChevronsUpDown/MoreHorizontal em `lib/icons` | sidebar-demo S2–S6 |

F1 (2026-09-16): nenhum pacote motion além de `motion/react` nos 11 docs → nada a
instalar; `use-mobile` só no Sidebar (não adotado) → sem hook novo. Ícones
`Bold/Italic/Underline` adicionados a `lib/icons.tsx` (`FileJson` não existe no
lucide instalado → `FileCode` no lugar).

Dropdown radix (dono colou o doc + pediu adoção, 2026-09-16): vendored
`primitives/radix/dropdown-menu` + `components/radix/dropdown-menu` (+`use-data-state`;
`primitives-radix-checkbox` sem referência → skip). `ui/dropdown-menu.tsx` (Base-UI)
**deletado** — um sistema só. Footer `side="top"`, grupos, ícones+shortcuts,
`variant="destructive"` no logout, hover via `Highlight`. Correções no caminho:
crash `Menu.GroupLabel` fora de `Group`, `aria-selected` inválido do `HighlightItem`,
hooks incondicionais no `Slot`, radix abre com sequência pointer (só jsdom).

Notas do code-review (2026-09-16, working tree): `RequireStaff` lê flags da sessão
(emitidas pelo backend) e os fetches das páginas seguem com 403 real — autoridade
inalterada; seção "Bonus · KpiGrid" da gallery demonstra a live-region do shell
(registrada como extra intencional, não DEMO upstream); `line-length 128` vale p/
Python (`ruff`) — no client o gate é `oxlint` (linhas longas herdadas quebradas
oportunisticamente: `file-tree` ROW_CLASS, `toggle-group` cva).

## 12. Errata (2026-09-17, change `docs-consolidacao`) — §§1–11 acima são o debate original e seguem históricos; o que mudou depois:

**Continua válido:** regra de ouro dos ícones via `lib/icons.tsx` (§1); tokens do tema intactos (§3); `Inter Variable` + `JetBrains Mono` (§4); `motion/react` único + 120–250ms GPU + reduced-motion (§5); `GooeyMenu` restrito a debug + `DeplymentCard` descartado (§6); deferidos TanStack/Recharts/`ExpandDetails`/`FileTree` de produto/`SubscriptionCalendar` com gatilhos (§9 — `FileTree` como primitivo de UI foi portado no ledger §11 item 10, o que segue deferido é só seu uso em produto); `ring-2` em arquivo novo + `ring-1` legado oportunístico (§10); exceção `gooey-menu` width/height (§10); breakpoints drawer/rail (§10).

**Superado (com a change que superou):**
- §2 "não adicionar Radix novo" → exceção registrada: `dropdown-menu` radix vendored adotado a pedido do dono (`review-design.md:116-122`, change `sidebar-demo` S7.5); `ui/dropdown-menu.tsx` Base-UI **deletado** — um sistema só. Base-UI segue o padrão para o resto.
- §2 sidebar sobre Base-UI → iterações S7–S13 (`sidebar-demo` tasks): org switcher, subgroups, Workspaces removido (duplicava o switcher), grupo Projects tenant-scoped, rail abre menus, shell full-width com breadcrumb no header, scrollbar por tokens.
- §7 `use-mobile` "sem hook novo" → `use-mobile` blindado p/ SSR/jsdom existe (fix do crash S7.1).
- Collapsible Base-UI → trocado por `primitives/radix/collapsible` vendored (S8.6: Base-UI fechava seco, upstream tem AnimatePresence open+close).
- `components/animate-ui/` + `primitives/` planos → `custom-ui-restructure`: tudo sob `components/custom-ui/` (pasta por componente + `effects/`), proibido recriar `primitives/`, `radix/`, `animate/` (ver `docs/CLIENT-STRUCTURE.md`).
- Faltava a convenção de rotas → criada: `docs/CLIENT-STRUCTURE.md` + ADR 0013 (pasta espelha `ROUTES`, gate em `layouts/`, segmento dinâmico nunca é autoridade).
- Gallery "checklist manual de render staff" → segue manual; fila playground S2+ fatiada em uma change por componente (decisão do dono 2026-09-17).
- Nomes "Gallery"/"Playground" não remetiam à relação prova→uso (dono, 2026-09-19) → **funil**: `/admin/lab` (+ `/admin/lab/trials`) prova os itens `pending`, `/admin/gallery` mostra só os `validated` com onde são usados. `stamped` → `validated`; `playground`/`components` deixam de existir como rota. Staff-only vive sob `/admin`. Changes `lab-harness`/`lab-components`.

## 13. Catálogo do Lab (change `lab-harness` + `lab-components`, 2026-09-19)

**Fonte única**: `client/src/lib/catalog/` — `types.ts` (tipos), `entries.ts` (23 entradas, uma por
doc de `references/components_to_use/`, + `24 Collapsible`), `index.ts` (helpers). Cada entrada tem
`n` **estável e imutável** (append-only, compartilhado Lab ↔ Gallery), `class` (`component` |
`block`), `kind` (base/buttons/data/media/shell/identity/feedback), `status` (`pending` |
`validated` | `dropped`), `ref`/`refGroup` (doc-fonte), `source` (implementação ou `null` =
not ported) e `usedIn[]` (`{label, to?, scope}` — link rápido quando há rota, senão texto;
`scope` = app/admin/shell).

**Provas**: `components/catalog-demos.tsx` mapeia `slug → ReactNode` (mesmo registro nas duas
telas). **Validar um item = flipar `status` no catálogo** — a prova migra de `/admin/lab/trials`
para `/admin/gallery` sozinha. Novos itens chegam como novo doc em `references/` → append com o
próximo `n`.

| # | Item | class | kind | status | Decisão |
|---|---|---|---|---|---|
| 01 | 404PageNotFound | block | feedback | ✅ validated | Portado como `ErrorOne`, em produção na rota `*`; validado pelo dono (visual, 2026-09-19). |
| 02 | Accordion | component | base | ✅ validated | Porte **próprio** em `custom-ui/components/accordion.tsx` sobre o `Collapsible` (radix + AnimatePresence). Reveal padrão **`mask`** — fiel ao primitivo upstream (`primitives-base-accordion`): máscara CSS animada (`--mask-stop` 0%→100%) + `y: 20`, então o conteúdo é revelado por cortina de cima p/ baixo e o que ainda não foi revelado fica invisível (sem texto translúcido sobre a separadora, que era o defeito do `slide` puro). Spring padrão `150/22` (igual ao componente do site). `reveal="depth"` (rotateX topo + scale) fica como alternativa e `slide` continua o default do `Collapsible`/sidebar. `multiple`, `keepRendered` e `onHover` suportados. Validado pelo dono em 2026-09-19 (prova de 5 colunas). |
| 02 · extra | `onHover` | — | — | — | Prop opt-in (`false` default) no `Collapsible` **e** no `Accordion`: o item abre no `mouseenter` e fecha no `mouseleave` pelo mesmo `setIsOpen` do clique (mesma animação). Clique/teclado/touch seguem funcionando — hover é gatilho **extra**, nunca o único. |
| 03 | AlertDialog | component | base | ✅ validated | Porte **próprio** em `custom-ui/components/alert-dialog.tsx` (dívida §14 convergida): portal em `AnimatePresence` + `keepMounted`, backdrop com fade e popup com **flip 3D** (`perspective(500px)` + `rotateX|rotateY` via prop `from`, `scale 0.8→1`), **ambos com exit**; spring **500/32** (~0.25s, dentro da faixa 120–250ms do `DESIGN.md` §7 — pedido do dono) e backdrop em 0.15s. Centralização por `AlertDialog.Viewport` (sem `translate` brigando com o transform do motion). Blur: `backdrop-blur-sm` estático no overlay (o `filter: blur()` do upstream é invisível sobre camada chapada) + `filter: blur(4px→0)` animado no popup — exceção de GPU consciente (bounded). **`from` agora default `bottom`** — convenção global do app registrada no `DESIGN.md` §7 (diretriz 6). Validado pelo dono em 2026-09-19. |
| 04 | AnimatedCircularProgressBar | component | data | ✅ validated | Reescrito como **porte fiel do magicui** (`custom-ui/components/circular-progress.tsx`, sem dívida): dois `<circle>` + **gap de 5%** (`--gap-percent`, secundário com `scaleY(-1)`), `strokeDasharray: calc(var(--stroke-percent) * var(--percent-to-px))` via CSS vars, `1s` na curva `ease` — em vez do anel único com `stroke-dashoffset` 200ms do porte antigo. Delta nosso: **`animateOnMount`** (default `true`) preenche de `min` até `value` a cada montagem com o **número contando junto** (um único driver JS com a bezier do `ease`, para anel e contador não desandarem), `transitionLength` configurável, reduced-motion cai no valor final, `role="progressbar"`/aria no wrapper (o upstream não tem) e cores por token. Prova = loop do demo upstream (0→100 de 10 em 10 a cada 2s) + Replay mount + gêmeo com `animateOnMount={false}`. **Defaults = variante completa** (preenche ao montar + label + anel inteiro; o resto é opt-out). Validado pelo dono em 2026-09-19. |
| 05 | Checkbox | component | base | ✅ validated | **Porte do componente composto do site** (`components-base-checkbox`) em `custom-ui/components/checkbox.tsx` (dívida §14 convergida): estética por `cva` — caixa `size-5`, `sm` `size-4.5 rounded-[5px]`, `lg` `size-6 rounded-[7px]`; `default` = `bg-background border`, `accent` = `bg-input`; marcado/indeterminado com `bg-primary` + `text-primary-foreground` e `transition-colors duration-500`; indicador `size-3.5/3/4`. O indicador é renderizado pelo próprio componente (children primeiro), então `<Checkbox />` sozinho basta. Comportamento do primitive: `motion.button` (escala só no **press**) e check desenhado por `pathLength` (0.2s, +0.2s de delay) ou linha em `indeterminate`; o crescimento no **hover** foi **removido a pedido do dono** (leitura poluída). Delta nosso: `ring-2` (DESIGN.md §8 — o site usa 3px + offset) e reduced-motion. Prova: 6 variantes (inclui disabled). **Validado pelo dono em 2026-09-19** (com o crescimento no hover removido a pedido). Contorno do marcado (`design-contrast-borders`, 2026-09-23): `border-primary-foreground/80` — antes a borda neutra (`--border`) ficava por cima do verde. |
| 06 | CopyButton | component | buttons | ✅ validated | **Porte do componente composto do site** (`components-buttons-copy`) em `custom-ui/components/copy-button.tsx`: cva com as variantes do site (`default`/`accent`/`destructive`/`outline`/`secondary`/`ghost`/`link`) e tamanhos quadrados (`size-9`, `xs` `size-7`, `sm` `size-8`, `lg` `size-10`), `content`/`copied`/`onCopiedChange`/`delay` (3000ms) e a assinatura visual: **troca de ícone por `AnimatePresence mode="popLayout"`** com `scale + blur(4px)` (0.25s) em vez do fade simples anterior; `hoverScale`/`tapScale` (1.05/0.95) expostos. Delta nosso: `ring-2` (DESIGN.md §8), ícones via `lib/icons`, sem `console.error` em clipboard negado e timer limpo no unmount; **crescimento no hover removido a pedido do dono** (só `tapScale` no press, mesma decisão do Checkbox); uso inline em produção (Orgs/Users) passa `variant="ghost"` explícito para seguir discreto ao lado dos IDs. Prova: 7 variantes + 4 tamanhos. **Validado pelo dono** (o catálogo já refletia `validated`; esta linha foi sincronizada na consolidação do commit da fila). |
| 09 | Dialog | component | base | ✅ validated | **Porte do composto do doc** (`components-base-dialog` sobre `primitives-base-dialog`) em `custom-ui/components/dialog.tsx` (dívida §14 convergida): `DialogContent` = o `DialogPopup` do upstream — **`showCloseButton`** (default `true`: X no topo-direito com `<span className="sr-only">Close</span>`, `ring-2` per §8) e **`from`** (flip 3D `perspective(500px)` + `rotateX\|rotateY`, `scale 0.8→1`, blur 4px) com **default `bottom`** (DESIGN.md §7, diretriz 6) — com o **layout copiado do 03 `AlertDialog`** (dono, 2026-09-23 — consistência visual): painel `w-full max-w-md … p-6 shadow-lg`, header `mb-4 gap-1.5`, título `text-lg font-bold tracking-tight`, descrição `text-sm text-muted-foreground`, footer `mt-5 flex-col-reverse gap-2 sm:flex-row sm:justify-end` (o doc traz `grid gap-4 sm:max-w-lg`, header `gap-2 text-center sm:text-left`, título `leading-none font-semibold` e footer sem margem — trocados pela consistência). Portal gated por `AnimatePresence` + `keepMounted` (entrada **e** saída animadas), backdrop fade 0.15s + `backdrop-blur-sm`, spring **500/32** (upstream 150/25 — token do dono ~0.25s), superfície `bg-card text-card-foreground`, reduced-motion instantâneo, ícones via `lib/icons`. Prova: demo do doc (form "Edit profile" com `Input`s + Salvar/Cancelar) como default (1º diálogo, `from=bottom`) + variantes rotuladas `variant: from="top"` e `variant: showCloseButton=false`. **Validado pelo dono em 2026-09-23** (pediu o layout do 03 copiado para consistência visual e as variantes rotuladas). |
| 07 | CreditUsageCard | block | data | pending | Bloco alinhado à fonte do doc (`max-w-135`, `rounded-xl`, `md:px-8`, `duration-700` dos segmentos, `window.print()`, animação do download) e com o **rim nos segmentos preenchidos em `/76`** — não a base `/80`: com `sm:gap-1` (4px) cada segmento ficava com ~2,4px no `md` e a borda engolia o fill (dono viu as barras sumirem); correção do dono (2026-09-23): barra **mais comprida e ligeiramente mais larga** — `h-3 → h-3.5` e `sm:gap-1 → gap-px` (segmentos de ~5,4px), borda em **`/60`** (valor seco pedido pelo dono; 2.15:1 contra o fill, abaixo do 3:1 de propósito — a leitura vem do preenchimento e dos gaps) e **barras vazias em `muted-foreground/70` nos dois temas** (no dark o `muted` puro ficava a 1.01:1 contra o trilho; no light, a 1.40:1 — agora 3.19:1 e 2.32:1; dono, 2026-09-23: "mesmo padrão no light"). O **toggle inline** (`role="switch"` + `motion.span` com `x: 18.5`) foi **substituído pelo `25 Switch`** (dono, 2026-09-23: "deve usar o switch que criamos") — 40×20 controlado, `onCheckedChange` alimentando `onAutoSwitchChange`, `aria-label` próprio e `shrink-0`. Prova: o próprio card no card do lab. Aguarda veredito do dono. |
| 06–23 | (demais) | — | — | pending | `DeplymentCard` (08) `dropped` (duplicata do RunActionButton, §6); `ExpandDetails` (11) e `SubsriptionCalendar` (18) ainda não portados. Todo o resto será revisto 1-a-1. |
| 24 | Collapsible | component | base | pending | Vendored radix + AnimatePresence; é o padrão de disclosure da sidebar (e a base do item 02). Sem doc próprio — entrou com o porte do Sidebar (`ref: AnimateUi/Sidebar.md`). |
| 25 | Switch | component | base | ✅ validated | Base extraído do `SwitchModeToggle` (19) para reuso: trilho pill, knob com spring (`layout`), `startContent`/`endContent` onde o lado do knob lê como ativo, controlado ou não, `width`/`height`. **Cores pela linguagem do Checkbox validado** (dono, 2026-09-19) + **camada de contorno** (`design-contrast-borders`, 2026-09-23): ativo = trilho `bg-primary` (**fundo cheio** — dono, 2026-09-23: "a suavidade fica nas bordas", o fill nunca é atenuado) com **as duas bordas iguais por estado** (calibradas pelo próprio dono na validação): ON trilho e knob em `border-primary-foreground/30` (2.06:1 vs branco; 1.36:1 vs o verde — mais suave que o 3:1 geral, decisão estética), conteúdo colorido pelo que está embaixo (ícone ativo sobre o knob = `text-foreground`; inativo sobre o verde = `text-primary-foreground`, 9.11:1); OFF = `bg-background` + `border-border/50` e knob `bg-muted` + `border-border/50` (1.51:1 vs branco); `transition-colors duration-500` como o Checkbox. **`theme-toggle` (19) NÃO consome este base** (dono, 2026-09-23): é escolha de estado (sun|moon), não on/off, e não usa primary — volta à implementação própria. Prova: default/off/disabled/small/large + controlado. **Validado pelo dono em 2026-09-23** (ele mesmo calibrou os alphas das bordas: 30% ON / 50% OFF). |

## 14. Dívida declarada: customização em `/ui` (change `custom-ui-accordion`, 2026-09-19)Regra (dono, 2026-09-19; em `CLIENT-STRUCTURE.md` §Componentes): **`/ui` é a base shadcn intocada**;
o componente visual que a página usa mora em `/custom-ui` e pode compor a base por baixo.

O `animate-ui-adoption` reconciliou motion/padrões **dentro** de `/ui` antes de a regra existir, e o
`custom-ui-restructure` moveu só os 9 avulsos. Ficou dívida:

| Arquivo em `/ui` | O que carrega | Quem importa hoje |
|---|---|---|
| `alert-dialog.tsx` | + motion/spring | ninguém (o 03 usa o porte `custom-ui`) |
| `accordion.tsx` | Base UI + motion/spring upstream | ninguém (o 02 usa o porte `custom-ui`) |
| `checkbox.tsx` | + motion | ninguém (o 05 usa o porte `custom-ui`) |
| `dialog.tsx` | + motion/spring | ninguém (o 09 usa o porte `custom-ui`) |
| `radio.tsx` | + motion | prova do 15 |
| `tabs.tsx` | pill deslizante + motion | prova do 20 |
| `toggle-group.tsx` | variantes do referência + contexto | prova do 21 |
| `avatar.tsx` | AvatarImage + presence dot | `app-sidebar.tsx`, `avatar-group.tsx` |
| `switch.tsx` | Base UI próprio | `pages/grants/Grants.tsx` |

**Convergência**: nenhum deles é editado; ao validar cada item no Lab, cria-se a versão
`custom-ui/components/<nome>` e o catálogo/ página passam a apontar para ela. Itens que **já** têm
consumidor de produção (`avatar` → sidebar, `switch` → Grants) têm prioridade quando chegar a vez.

## 15. Contraste do `--primary` no light — medido 2026-09-19, resolvido pela `design-contrast-borders` (2026-09-23)

Medição com conversão oklch→sRGB + WCAG (o tema é `oklch(0.8487 0.2181 127.8)`, um lima claro, L≈0.85):

| Par (light) | Razão | Dark |
|---|---|---|
| Segmento `bg-primary` sobre o card | **1.51:1** | 11.04:1 |
| Segmento sobre a barra (`bg-muted/50`) | **1.19:1** | — |
| Knob do switch sobre o trilho | **1.43:1** | 4.41:1 |
| Trilho `primary/15` sobre o card | **1.05:1** | 2.51:1 |
| Texto `primary-foreground` sobre `primary` | 9.11:1 ✅ | 9.11:1 |

**Leitura**: `--primary` funciona como **superfície com `primary-foreground` por cima** (botão default,
badge, checkbox marcado: ≥9:1), mas **não** como preenchimento/indicador sobre fundo claro. `--ring =
--primary` estende isso a **todo foco em light** (1.51:1, abaixo dos 3:1 de WCAG 1.4.11).
Verdes já adequados no tema: `--chart-3` (4.92:1 no branco), `--chart-5` (6.09:1), `--primary-foreground` (13.76:1).

**Resolução** (change `design-contrast-borders`, dono 2026-09-23 — escopo "tokens + componentes", intensidade "equilibrada"):
- Tokens do light: `--border`/`--input` `0.7309 → 0.66` (**3.12:1**) e `--ring → --chart-3` (**4.92:1**); dark intacto.
- Regra nova no `DESIGN.md` §4.5: **todo preenchimento colorido ganha contorno no tom do conteúdo**
  (`border-*-foreground/80`), aplicada no Switch (trilho ativo + knob), Checkbox (marcado/indeterminado) e
  segmentos do `CreditUsageCard`.
- Alphas no Switch (dono, 2026-09-23): calibrados por ele na validação — trilho e knob iguais por estado (`primary-foreground/30` no ON, `border-border/50` no OFF), mais suaves que o 3:1 geral por decisão estética; fora do Switch a base `/80` (≥3:1) segue no checkbox/card.
- Segue valendo "`--primary` é cor de superfície" (com `primary-foreground` por cima, 9.11:1) — preenchimento
  fino em fundo claro usa `--chart-2…5` quando não houver contorno.
- Follow-up registrado: convergir `Grants` (`ui/switch`) e o toggle do `CreditUsageCard` para o `25 Switch` já com as cores corrigidas.
