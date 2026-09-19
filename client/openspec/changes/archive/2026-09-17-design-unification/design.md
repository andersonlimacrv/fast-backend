## Context

`client/` (Vite + React 19 + TS + Tailwind v4 + shadcn `new-york/zinc` + `@base-ui/react@1.8.0` +
`motion@13.3.0` + `lucide-react`) já segue `docs/DESIGN.md §4.2` nos tokens
(`client/src/index.css:1-256`, tema `tweakcn opencode_AC_VARIATION`, dark por classe `.dark`
via `src/external/theme.ts`). Falta a camada de **shell de dashboard**: sidebar, layouts
reutilizáveis, tipografia dedicada e fonte única de ícones. `references/components_to_use/`
(17 docs + 5 `ExempleLayours/`) foi inventariado em 2026-09-16: 11 itens entram nesta change
(9 diretos + `RunActionButton`/`GooeyMenu` portados), 3 vão p/ spec futura, 1 descartado.
`docs/review-design.md` registra os contrastes p/ debate. Backend é autoridade
(`CurrentPrincipal → Membership → CurrentTenant`); UI só reflete `is_staff/isRoot`.

## Goals / Non-Goals

**Goals:** shell admin mobile-first com sidebar `DESIGN.md §6`; fonte única de ícones+SVGs;
primitivos auditados sobre Base-UI; tipografia `§4.3`; a11y `§8` com gate `axe`; PR única + release minor.
**Non-Goals:** dados server-side (TanStack), gráficos (Recharts/Tremor), `ExpandDetails`/`FileTree`/
`SubsriptionCalendar`, qualquer mudança em `app/`, novas skills, mudança de cores/radius.

## Decisions

1. **Base UI, não Radix/animate-ui, sob o shadcn** — `DESIGN.md §2` (Base UI v1.0 estável dez/2025,
   padrão do `shadcn init` desde jul/2026) + projeto já em `@base-ui/react@1.8.0`. A Sidebar de
   referência (que cita `radix`/`animate-ui`) é reimplementada sobre Base-UI; `asChild` (sintaxe Radix)
   não entra em código novo — render props onde Base-UI exigir.
2. **`lib/icons.tsx` como regra de ouro (duas libs, um lugar)** — decisão do dono 2026-09-16:
   `lucide-react` (padrão `DESIGN.md #9`, `components.json iconLibrary`) + `react-icons@5.7.0`
   coexistem **somente** como re-exports + SVGs locais componentizados. Redução a uma lib é
   dívida futura explícita (ver Riscos). `oxlint` + review bloqueiam import direto fora dele.
3. **Tipografia `DESIGN.md §4.3`** — `Inter Variable` (UI/texto) + `JetBrains Mono Variable`
   (valores tabulares/KPIs) via `@fontsource-variable/*@5.3.0` pinados (self-hosted, sem CDN,
   sem FOUT de rede). Escolhidos sobre `Geist` por serem variable fonts maduras no fontsource
   com `tabular-nums` garantido; troca por Geist futura é só token.
4. **Só `motion`, micro-interações 120–250ms** — `DESIGN.md §7`: anima o que responde a ação
   do usuário ou comunica mudança de estado; `AnimatePresence popLayout` só no load de dados
   (`KpiGrid`); `gsap/lenis/three/rive/lottie/anime/auto-animate/spring` banidos sem caso real.
5. **Portes com reescrita, não cópia** — `RunActionButton` (fora `react-icons/fa6/ri/bs/tb/hi/io5`,
   só `Zap` via `lib/icons`; restrito a jobs), `GooeyMenu` (ex-`Tooltip.md`, debug overlay),
   `FileUploader`/`CreditUsageCard`/`NotFound` (tokens `bg-card/border-border/text-muted-foreground`,
   `var(--primary)` no grid). Hardcodes `zinc`/hex das variantes viram `var(--color-*)`.
6. **`next-themes` e `react-use-measure` não entram** — theme usa `external/theme.ts` + classe `.dark`
   existentes; `use-measure` (dependência fantasma de `ExpandDetails`) fica com a spec futura.
7. **Deferidos com motivo** — TanStack/Recharts: sem endpoint paginado real no admin hoje, seria
   peso morto (+~50–100 KB); `table.tsx` estática + colapso mobile (2–3 colunas + expansível) basta.
   `SubsriptionCalendar`: billing avançado sem caso de uso no v1.

## Risks / Trade-offs

- [Duas libs de ícone convivendo (`lucide` + `react-icons@5.7.0`) aumenta superfície de bundle;
  mitigado pela fonte única (tree-shaking por re-export nomeado) + dívida registrada p/ unificar] —
  aceito pelo dono 2026-09-16.
- [`react-icons@5.7.0` é novo no projeto; licença MIT, mantido pela comunidade — auditado no uso
  (só ícones, sem scripts)] — pin exato + `allowed-tools` leitura.
- [Sidebar sobre Base-UI em vez do snippet `radix/animate-ui` exige adaptação do `Sidebar.md`;
  mitigado por `ui-catalog.test.tsx` + snapshots] — risco baixo-médio.
- [Fontes self-hosted somam ~100–200 KB woff2; mitigado por variable fonts (1 arquivo por família)].

## Migration Plan

Só `client/` + `docs/review-design.md`. Ordem F1→F4 (`tasks.md`); cada fase com `vitest + build`
verdes antes da próxima. Rollback = revert da PR (nenhuma migração de dados; cookie da sidebar
é `localStorage`/cookie best-effort, ausência = default expandida `>xl`). Release minor após merge.

## Dívida futura (specs próprias, fora desta change)

- `unify-icons-single-lib`: avaliar remover `react-icons` (contar usos reais pós-PR via `lib/icons.tsx`).
- `admin-datatable`: TanStack Table + Query + virtualização quando houver paginação server-side.
- `admin-charts`: Recharts (ou Tremor) ligado a `var(--color-chart-*)` quando houver métricas reais.
- `inspector-panels`: `ExpandDetails` + `FileTree` + `SubsriptionCalendar` (onde se encaixam).

## Open Questions

- Nenhuma bloqueante (PR única + release minor, duas libs num arquivo, tipografia `§4.3`,
  sidebar `§6` — tudo confirmado pelo dono 2026-09-16).
