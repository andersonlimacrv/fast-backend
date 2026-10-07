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
  explorer, billing avançado). Gatilho: caso de uso + change própria. **Errata (2026-09-23):** `FileTree` já foi portado (`custom-ui/components/file-tree.tsx`, prova no lab), o **`ExpandDetails` (11)** na `custom-ui-expand-details` e o **`SubsriptionCalendar` (18)** na `custom-ui-subscription-calendar` — **fila de portes zerada**; os três seguem com `usedIn: []` até aparecer o encaixe de produto.

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
| 07 | CreditUsageCard | block | data | ✅ validated | Bloco alinhado à fonte do doc (`max-w-135`, `rounded-xl`, `md:px-8`, `duration-700` dos segmentos, `window.print()`, animação do download) e com o **rim nos segmentos preenchidos em `/76`** — não a base `/80`: com `sm:gap-1` (4px) cada segmento ficava com ~2,4px no `md` e a borda engolia o fill (dono viu as barras sumirem); correção do dono (2026-09-23): barra **mais comprida e ligeiramente mais larga** — `h-3 → h-3.5` e `sm:gap-1 → gap-px` (segmentos de ~5,4px), borda em **`/60`** (valor seco pedido pelo dono; 2.15:1 contra o fill, abaixo do 3:1 de propósito — a leitura vem do preenchimento e dos gaps) e **barras vazias em `muted-foreground/70` nos dois temas** (no dark o `muted` puro ficava a 1.01:1 contra o trilho; no light, a 1.40:1 — agora 3.19:1 e 2.32:1; dono, 2026-09-23: "mesmo padrão no light"). O **toggle inline** (`role="switch"` + `motion.span` com `x: 18.5`) foi **substituído pelo `25 Switch`** (dono, 2026-09-23: "deve usar o switch que criamos") — 40×20 controlado, `onCheckedChange` alimentando `onAutoSwitchChange`, `aria-label` próprio e `shrink-0`. Os **dois popovers artesanais viraram componentes reutilizáveis** (`billing/credit-usage-card-menus.tsx`, change `billing-card-menus`, dono 2026-09-23): `UsagePeriodMenu` (opções como `DropdownMenuRadioItem` — `menuitemradio` no lugar do `listbox`) e `UsageActionsMenu` (itens data-driven, `side="top"`), ambos sobre o pacote Radix vendored que a sidebar usa, `modal={false}`; saíram o estado `activePopover`, os refs, os listeners de `document` e os `AnimatePresence` do card. A **barra de porcentagem virou componente** (`custom-ui/components/segmented-progress-bar.tsx`, change `segmented-usage-bar`, dono 2026-09-23: as barras pareciam ter espaçamento desigual): controlado (`value`/`max`/`segments`/`heightPx`, default 14px, sem estado), células com **a mesma caixa** nos dois estados (preenchidas com o rim `/60`; vazias `border-transparent` + `bg-muted-foreground/70`) sobre **grid de colunas iguais** em vez de `flex-1` (era o `border` só nas preenchidas + arredondamento de fração que quebrava o ritmo), fade `1 - i × 0.004` preservado; a prova do lab ganhou um **slider** (`<input type="range">`) controlando `usedCreditsPercent`, então a label `%` e a barra leem o mesmo valor, com **slider tematizado** (`.lab-range` no `index.css`: knob sólido `--primary` + rim `--primary-foreground`, trilho `--muted` — o thumb nativo two-tone/cortado saiu), um **switch de `animateOnMount`** (remonta e repete) e a seção **"Modules of this block"** com `SegmentedProgressBar`, `UsagePeriodMenu`, `UsageActionsMenu` e o `25 Switch` **separados e legendados com o arquivo**. O card agora **preenche de 0 até o valor ao entrar na tela** (`animateOnMount` default `true` + `transitionLength` = 1000ms, o driver do 04: label e barra leem o mesmo pintado, `data-current-value` no root, `ariaValueNow` anuncia o valor real) — **entry-only** (dono, 2026-09-23: arrastar o slider durante o fill criava um bug de tweens de 1s por tick): alvo travado no mount e qualquer mudança de prop durante/depois do fill **liquida na hora** (cleanup mata o tween em voo; `onUpdate` arredonda para 1 casa e ignora frames no-op; sem loop em repouso), e o `%` usa **`font-mono tabular-nums`**. Prova: o próprio card no card do lab. **Validado pelo dono em 2026-09-23** (com o harness: slider, `animateOnMount` entry-only, mapa dos módulos e a label em mono). |
| 10 | DropdownMenu | component | base | ✅ validated | **Pacote radix vendored** (`custom-ui/components/dropdown-menu/`, pedido do dono — exceção registrada no §11; o Base-UI foi deletado). Já em produção na sidebar (org switcher, Projects rail/actions, user menu) e, desde 2026-09-23, nos menus do card 07 (evidência, não validação). **Prova própria adicionada** (change `custom-ui-dropdown-menu`, dono 2026-09-23): demo do doc com a superfície completa — `Label`, grupos com `Shortcut`, `Sub` ("Invite users"), `CheckboxItem`, `RadioGroup`/`RadioItem`, item `disabled` e `variant="destructive"` — + o placement do shell (`side="top" align="end"`) e os menus `modal={false}`. Testes: sub-menu por teclado (`ArrowRight`), `menuitemcheckbox` e `menuitemradio`. **Validado pelo dono em 2026-09-23.** |
| 19 | SwitchModeToggle | component | shell | ✅ validated | Pill sol/lua da topbar (`components/theme-toggle.tsx`), em produção desde o shell. Porte antigo do doc (`SwitchModeToggle.md`) com `src/external/theme.ts` (next-themes rejeitado, §7). **Mantém implementação própria** (dono, 2026-09-23): é escolha de estado (sun\|moon), não um switch on/off — não consome o `25 Switch` e não usa primary (`bg-muted` no knob, `border-border` no trilho). **Validado pelo dono em 2026-09-23** por já estar em uso na topbar. |
| 11 | ExpandDetails | block | data | ✅ validated | **Portado** (change `custom-ui-expand-details`, dono 2026-09-23 — estava deferido no §9) em `custom-ui/components/expand-details.tsx`, token-first: a coreografia do doc para **largura/altura** (width 320↔120, height medido, spring `200/22/1.2`, **delays invertidos** — collapse encolhe largura primeiro, expand cresce altura primeiro — chevron −90° em 0.2s e painel com blur 8px + y, `popLayout`). **Sem o `borderRadius` animado do doc** (20↔24, morph aberto→pill): decisão do dono — "não fica efeito pill e sim uma div que alterna o tamanho" e **as bordas sempre vêm das variáveis do `index.css`** → `rounded-xl` (`var(--radius-xl)`, 4px hoje, igual ao CreditUsageCard). **Sem `react-use-measure`**: a medição virou `ResizeObserver` local (a dep era fantasma, §7) com fallback `auto`; a variante `zinc`/`h-screen` ficou fora (o doc's `-base` já usava tokens). API: `title`, `items` (`wide` = `col-span-2`), `defaultOpen`, `expandedWidth`, `collapsedWidth`, `className` + `aria-expanded`/`ring-2`/reduced-motion. Prova: bloco default (aberto) + gêmeo data-driven (`Run`, 3 itens, colapsado). **Validado pelo dono em 2026-09-23** (pediu os cantos do tema: `rounded-xl`/`var(--radius-xl)`, sem morph de raio/pill). |
| 12 | FileTree | component | data | ✅ validated | **Reescrito** como o `components/base/files` pedido pelo dono (change `custom-ui-files`, 2026-09-23 — o porte data-driven antigo foi deletado): `Files/FolderItem/FolderTrigger/FolderPanel/FileItem` compostos sobre o primitivo — religado no **nosso Accordion/Collapsible** (dono: comportamento igual ao Accordion, sem snap seco; `mask` + spring 150/22), com highlight animado que segue o mouse, ícone de pasta que troca open/close e git em letras U/M/D — cores só do `index.css` (`destructive`, `chart-2`, `chart-4`), sem `onSelect` (fiel ao upstream; pastas seguem acessíveis por teclado). `Folder` + `File` entraram no `lib/icons`. Prova reescrita em forma composta (mesmo conteúdo). **Validado pelo dono em 2026-09-23** (comportamento do Accordion validado junto: expansão suave, sem snap). |
| 18 | SubsriptionCalendar | block | data | ✅ validated | **Portado** (change `custom-ui-subscription-calendar`, dono 2026-09-23 — era o **último doc não portado**, deferido no §9) em `custom-ui/components/subscription-calendar.tsx` como a estrutura da registry Watermelon (`ui.watermelon.sh`) **100% nas cores do projeto** (dono: esquema nosso, sem laranja): entrada `scale 0.96 → 1` (spring 420/28/0.6), header mês/ano com "Today" + prev/next + **"+"** com glow, **três overlays** `backdrop-blur` (quick add com form de 3 inputs, busca, resumo Active/New/Total Spend), semana em pills, grade de dias (`aspect-square sm:h-12`, muted/normal, **selecionado em primary nos dois temas** — `border-primary` sólida `border-2` sobre `bg-primary/60`, número em `text-primary-foreground` (dono: mesma spec, só o matiz — 10.97:1 light · 5.8:1 dark, sem mexer no número) — com `layoutId` escopado por `useId`, logos + indicadores) e footer (legenda `chart-2`/`chart-4`, SUBS/NEW, busca/exportar/resumo + MONTHLY TOTAL). **Tudo em tokens** (dono: esquema nosso): `bg-primary`, `bg-chart-2/10`, `text-chart-2`, glow com `color-mix` do primary, cantos `rounded-xl` — e os acentos seguem a regra do fill cheio (`bg-primary` + conteúdo escuro, 9.11:1; tints apagavam, per o dono). `xs:` → `sm:` (o tema não tem esse breakpoint), press-only no "+", timer do exportar limpo, aria (`aria-label` nos ícones, `aria-pressed` nos dias) + `ring-2` + reduced-motion; `TbCube` entrou no `lib/icons`. Prova: mês navegável do doc com logos em **iniciais coloridas**. **Validado pelo dono em 2026-09-23** (com o dia selecionado em primary 2px/60 e o hover sutil). |
| 15 | Radio | component | base | ✅ validated | Validado como está (dono, 2026-09-23): a prova usa o porte em `/ui/radio.tsx` direto (`RadioGroup` com owner/admin/member, `defaultValue="member"`). A linha de dívida do §14 segue aberta — convergência para `custom-ui` pode acontecer depois, como no 03/09. |
| 21 | ToggleGroup | component | buttons | ✅ validated | **Convergido** do porte Base-UI em `/ui` (dívida §14 quitada nessa linha) para o **`primitives/radix/toggle-group`** pedido pelo dono (change `custom-ui-toggle-group`, 2026-09-23 — `https://animate-ui.com/docs/primitives/radix/toggle-group`): pacote Radix vendored (`primitive.tsx`: single\|multiple controlado, motion.button + `whileTap` com guard de reduced-motion, `Highlight` deslizante spring 200/25 + overlays por item no multiple) + camada composta (`toggle-group.tsx`, **nosso layout**): linha `inline-flex gap-1`, item `h-9 min-w-9 rounded-md text-sm` + `ring-2` de foco (§8) + `disabled:` + `svg:size-4`, seleção pintada **só** pelo pill `bg-accent` (sem `data-[pressed]:bg-*` duplicado **e sem hover próprio** — fix 2026-09-30: o `hover:bg-accent` fazia o não-selecionado imitar o selecionado; o demo deixa os itens nus), nomes do upstream (`ToggleGroupItem`, sem alias; cva do `/ui` descartado — sem consumidores). Prova reescrita (single + multiple, como no doc; multiple com `bg-accent rounded-md` por item como no demo). **Validado pelo dono em 2026-09-30.** |
| 06–23 | (demais) | — | — | pending | `DeplymentCard` (08) `dropped` (duplicata do RunActionButton, §6); **nenhum doc resta não portado** (fila zerada em 2026-09-23). Todo o resto será revisto 1-a-1. |
| 14 | Inputs | component | base | ✅ validated | **Porte fiel** do doc (`custom-ui/components/floating-input.tsx`, change `custom-ui-inputs`, 2026-09-30 — referência Watermelon): campo `bg-transparent` (o `bg-input` virava patch sob o chip da label), **notch medido estilo MDC** (stub + gap da largura da label + segmento final, `ResizeObserver`) no lugar do chip de fundo — sem linha sobre o texto em nenhuma superfície — com abertura em 100ms (pronta antes dos 150ms da label) e fechamento espelhado (`delay-75`), `hasValue` inicial de `value`/`defaultValue` (pré-preenchido abre flutuado), `disabled:` da casa; autofill global com repaint do UA congelado + tinta `muted/60` (regra fora de `@layer`). Prova com todas as variações (email, password, pré-preenchido, disabled, plain). **Validado pelo dono em 2026-09-30.** |
| 23 | UserAvatar | component | identity | ✅ validated | **Convergido** do `avatar-group.tsx` raiz (dívida §14 quitada nessa linha) para o **`primitives/animate/avatar-group`** pedido pelo dono (change `custom-ui-avatar-group`, 2026-09-30 — exatamente o upstream): pacote vendored (`primitive.tsx`: `Tooltip` por avatar com shift `y: -30%`, spring 300/17) sobre o **nosso tooltip** (nada vendorizado de novo) + camada composta (**nosso molde**): cada filho é o nosso `ui/avatar` (foto + iniciais + dot), tooltip só com o nome, `max`/`+N` + `"N online"` mantidos, anel `ring-background`, overlap `-space-x`. **`components/avatar-group.tsx` deletado por completo** (dono: sem dualidade); `ui/avatar.tsx` fica (sidebar em produção — follow-up pós-validação). **Revisão 2026-09-30**: API explícita (`mode` multiple|single, `user`/`users`, `onHover`, `tooltip`, `showPresence` — defaults multiple/true/true/false) e padrão de presença em `ui/avatar` (3 estados por token, dot fora do corte, `DESIGN.md` §4.5). Prova com todas as variações (single ± tooltip, presença nos 3 estados, `onHover` off, sizes/overflow). **Validado pelo dono em 2026-09-30** — primeiro consumo em produção no footer da sidebar (`mode="single"`, sem tooltip). |
| 20 | Tabs | component | base | ✅ validated | **Convergido** do porte `/ui` (dívida §14 quitada nessa linha) para o **`primitives/base/tabs`** pedido pelo dono (change `custom-ui-tabs`, 2026-09-30 — exatamente o upstream): pacote Base UI vendored (`primitive.tsx`: controlado + contexto, `Highlight` deslizante spring 200/25 com `click={false}`, painéis com blur via `AnimatePresence`, `TabsPanels` auto-height com nosso ResizeObserver keyado pelo value + modo `layout`) + camada composta (**nosso layout**): lista `bg-muted rounded-lg`, tabs nus com `ring-2` (§8, sem fill/hover próprio — só o Highlight pinta), pill `bg-background` + sombra, nomes upstream (`TabsTab`, sem alias; `TabsIndicator` morto). **`/ui/tabs.tsx` deletado por completo** (dono: sem dualidade). Prova = demo do doc (account/password com `ui/input` + `buttonVariants`) + gêmeo `layout` rotulado. **Validado pelo dono em 2026-09-30** (duas variações do mesmo componente — `auto-height` + `layout`; fix do clique morto verificado no browser). |
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
| `tabs.tsx` | — | **deletado** (change `custom-ui-tabs`, 2026-09-30 — o 20 usa o porte `custom-ui`; sem dualidade) |
| `toggle-group.tsx` | variantes do referência + contexto | prova do 21 |
| `avatar.tsx` | AvatarImage + presence dot | consumido dentro de `custom-ui/components/avatar-group/` (a sidebar usa o grupo `single`) |
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
