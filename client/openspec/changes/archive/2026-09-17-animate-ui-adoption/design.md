## Context

10 primitivos próprios (`design-unification`: Base-UI + `motion@13.3.0` + tokens tweakcn)
vs 11 docs vendored `references/components_to_use/AnimateUi/` (upstream animate-ui por
`imskyleen`: cada doc traz CLI + Link + DEMO + Usage + API Reference). Reconcile traz os
motion patterns que nos faltam sem importar defaults visuais do upstream. Auditoria radix
(2026-09-16): só `Sidebar.md` usa a trilha radix (wrappers `animate-ui/*/radix/*` não
vendored); `Accordion.md:111` "collapsible" é prosa. Demais: `base`/`community` sobre Base-UI.

## Goals / Non-Goals

**Goals:** upstream comportamental (transições, `AutoHeight`, scales, grupo, files) sob
nossos tokens; `FileTree` novo; gallery staff-only; ledger auditável.
**Non-Goals:** MCP, CLI live-install, Sidebar radix, novas libs motion, troca de ícones,
gráficos/tabelas server-side, `ExpandDetails`/`SubsriptionCalendar`.

## Decisions

1. **Vendored como fonte, nunca live-install** — `npx shadcn add @animate-ui/...` puxaria
   latest + defaults (`rounded-2xl`, `neutral-*`) por cima do tema; `references/` é
   imutável e auditável (hierarquia `AGENTS.md`). DEMOs são copiados e adaptados, não colados.
2. **Sem MCP shadcn** (decisão do dono 2026-09-16) — remoto = superfície rede/exfiltração +
   entrada em registry + auditoria, para conteúdo que já temos congelado. Reavaliar se um
   dia precisarmos de componentes fora dos 11 vendored.
3. **Sidebar nossa mantida** (dono condicionou a auditar radix: só Sidebar usa; wrappers
   não vendored) — importa-se só motion patterns. `use-mobile` decide-se em F1.
4. **`motion@13.3.0` é o teto** — F1 audita os 11 docs; qualquer outro pacote motion vira
   pergunta com pin antes de instalar ("não muitas" — ordem do dono).
5. **Adaptação token-first** — regra mecânica: `rounded-2xl`→escala do tema (`rounded-lg`,
   que com `--radius: 0` zera), `neutral-*`→`muted-*`/`foreground`, `zinc-*`→tokens,
   hex→`var(--color-*)`; durações → ≤250ms; `useReducedMotion`/`prefers-reduced-motion`.
6. **Gallery fora do bundle público** — rota staff-only (`RequireStaff` + 403 backend real);
   code-split se o build acusar peso (F5.5).
7. **Lanes por componente, arquivos disjuntos** — `general` ×3 em paralelo; eu faço
   fundação (F0/F1), gallery, `lib/icons`, pontes, gates, commits, PR. Retorno de subagente
   é rascunho até passar nos gates reais.

## Risks / Trade-offs

- [`AutoHeight` (motion `height: auto`) mede DOM em runtime; custo por troca de aba, ok p/
  settings; se o build/perf acusar, trava altura com `min-h` + documenta] — aceito, medir em F5.5.
- [DEMO upstream com `Label`/`Input` shadcn — os nossos `ui/input.tsx` + `feedback.tsx Field`
  cobrem; Label dedicado só se algum DEMO exigir `htmlFor` complexo] — decidir por DEMO.
- [AvatarGroup novo vs estender Avatar — novo arquivo, `Avatar` intacto (contrato de teste)].

## Migration Plan

`feat/animate-ui-adoption`: F0/F1 (eu) → lanes A/B/C (paralelo) → gallery (eu) →
audits → e2e + seed linux → gates backend → PR única → squash → minor (título `feat:`).
Rollback = revert da PR (sem migração de dados).

## Open Questions

- F1.2/F1.3 (motion extra? `use-mobile`?) — perguntar com evidência na fase F1.
- Ícones faltantes p/ ToggleGroup DEMO (`Bold/Italic/Underline`) — lane B reporta; eu adiciono.
