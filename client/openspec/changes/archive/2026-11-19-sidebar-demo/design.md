## Context

DEMO `RadixSidebarDemo` (`Sidebar.md:431-979`): Team Switcher (dropdown+⌘), NavMain
colapsável (4 grupos), Projects + `...` hover, NavUser dropdown, breadcrumb header,
placeholder. Imports animate-ui `radix/{sidebar,collapsible,dropdown-menu}` (wrappers
não vendored) + shadcn `breadcrumb/separator/avatar` + `use-mobile` + 22 lucide.
Tudo com equivalente Base-UI/CSS puro aqui.

## Goals / Non-Goals

**Goals:** DEMO completo sob Base-UI + tokens; org switcher real; subgroups; breadcrumb.
**Non-Goals:** radix npm, `use-mobile`, ações sem backend, reescrever `v0.3.0`.

## Decisions

1. **Base-UI Menu no lugar de DropdownMenu** — `Trigger/Content/Item/Label/Separator/Shortcut`
   com `Esc`/outside/arrow-keys nativos; `side/align` responsivo via `matchMedia` (padrão F1).
2. **Collapsible dedicado, não accordion** — semântica distinta (subgroup de nav vs painel
   de conteúdo); chevron `rotate-90` via `data-state` (padrão DEMO L591).
3. **Org Switcher = `switchOrg` existente** — mesma mutation da topbar; dropdown só muda o
   trigger. Single-mode + 1 org → switcher some (multitenancy mínimo).
4. **Recentes = `AuthContext.orgs[:3]`** — sem endpoint novo; `...` só View/Members (rotas
   existentes). Delete/Share exigem backend → fora, registrado no ledger.
5. **User dropdown = sessão real** — `user.email` + initials (AvatarImage só se backend
   mandar URL um dia); sem Upgrade/Billing/Notifs (sem feature; sem claims falsas).
6. **Breadcrumb estático por rota** — mapa `path → [trilhas]` + fallback; sem lib de router
   além de `useLocation`.
7. **`impeccable` como lente, não piloto** — `audit`/`critique` na sidebar nova antes do
   ok visual; `DESIGN.md` + 250ms + tokens vencem qualquer sugestão `bolder`.

## Risks / Trade-offs

- [22 ícones do DEMO podem não existir 1-a-1 no lucide instalado (precedente FileJson).
  Mitigado: auditoria S1.5 com equivalente documentado] — sem pergunta se equivalente óbvio.
- [Subgroups mudam IA da nav; membro continua sem ver Admin (filtro por flag, não por grupo)].

## Migration Plan

Só `client/` + docs. Ordem S1→S6; cada seção com teste; gates antes do ok visual;
**sem commit/PR** até aprovação (ordem do dono). Rollback = descartar working tree.

## Open Questions

- Nenhuma bloqueante (subgroups/org-fora-da-topbar/ações-`...` aprovados 2026-09-16).
