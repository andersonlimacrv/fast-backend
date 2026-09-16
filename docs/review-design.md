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
