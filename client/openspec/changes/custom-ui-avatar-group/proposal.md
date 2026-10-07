# custom-ui-avatar-group — proposal

## Why

O item 23 (`UserAvatar`) usa um `AvatarGroup` próprio em `components/avatar-group.tsx` (overlap, `+N`, `"N online"` — dívida §14, "overlap, +N, N online | avatar-group novo"). O dono pediu (2026-09-30) **exatamente o `primitives/animate/avatar-group` do animate-ui** (`https://animate-ui.com/docs/primitives/animate/avatar-group`), com precedência dos moldes do projeto: **moldar nosso avatar** (foto + iniciais + dot de presença) para dentro do componente novo e usar **nosso tooltip** (`custom-ui/components/tooltip`, já com `Provider/Tooltip/Trigger/Content/Arrow`).

## What Changes

- **Novo `custom-ui/components/avatar-group/primitive.tsx`** — vendored de `primitives-animate-avatar-group`: `AvatarGroup` (hover desloca `y: translate` default `-30%`, spring 300/17) + `AvatarContainer` + `AvatarGroupTooltip/Arrow` — com o **nosso tooltip primitive** (mesma API: `side/sideOffset/align/alignOffset`, `openDelay/closeDelay`, `transition`); sem `'use client'`; guard de reduced-motion no shift.
- **Novo `custom-ui/components/avatar-group/avatar-group.tsx`** (nosso molde, revisado 2026-09-30): API explícita — `mode="multiple"|"single"` (default multiple), `users` (multiple) / `user` (single), `onHover` (subida, default true), `tooltip` (default true; no single só tooltip, sem subida), `showPresence` (default false), `max=4`, `size sm|md` — cada avatar é o **nosso `ui/avatar`**; tooltip com **só o nome** (dono); overflow `+N` + `"N online"` mantidos; anel `ring-background`, overlap `-space-x` como no doc.
- **Padrão de presença em `ui/avatar.tsx`** (dono, 2026-09-30): o dot era cortado pelo `overflow-hidden` do root — `overflow-hidden` desce para o wrapper interno (foto/iniciais) e o dot vira irmão; 3 estados por token (`online = bg-chart-2`, `offline = bg-muted-foreground`, `inactive = hollow` com anel `muted-foreground`), `h-3 w-3 border-2 border-background`; registrado em `DESIGN.md`.
- **Deleção do `components/avatar-group.tsx` raiz** (dono: sem dualidade — prova + testes migram). `ui/avatar.tsx` fica intocado (sidebar em produção; a convergência dele é follow-up pós-validação).
- **Prova reescrita**: forma do demo (5 usuários, `invertOverlap`, shift no hover + tooltip por avatar) com iniciais (sem URLs externas — offline-first).
- **Testes migrados**: overlap/contagem, `+N`, tooltip com o nome, dot de presença, reduced-motion.
- **Docs**: `entries.ts` n=23, `review-design` §13 + §14, CHANGELOG.

## Capabilities

### New Capabilities

- Nenhuma.

### Modified Capabilities

- `lab-harness`: item 23 com o primitivo pedido, em prova forma-do-demo.

## Impact

- Novos: `custom-ui/components/avatar-group/{primitive.tsx,avatar-group.tsx}`, change `custom-ui-avatar-group`.
- Deletado: `components/avatar-group.tsx` (inteiro — sem dualidade).
- Alterados: `catalog-demos.tsx` (prova), `ui-catalog.test.tsx`, `entries.ts` (n=23), `review-design` §13/§14, CHANGELOG.
- **Intocados**: `ui/avatar.tsx`, `app-sidebar.tsx`, `custom-ui/components/tooltip/`.

## Non-goals

Converger o `ui/avatar` (follow-up pós-validação, com a sidebar); validar o item (fica `pending` até o ok visual).

## Acceptance criteria

1. `/admin/lab/trials` → card `23 UserAvatar`: overlap com `+N`, hover desloca o avatar para frente, tooltip com o nome, dot de presença visível.
2. Teclado/foco: tooltip segue o comportamento do nosso tooltip; Esc fecha.
3. Reduced motion: sem shift, sem spring de entrada.
4. Gates: `tsc`, `oxlint`, catálogo e build verdes; `components/avatar-group.tsx` não existe mais.
