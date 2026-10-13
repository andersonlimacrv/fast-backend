# root-mode — proposal

## Why

Root (`is_superuser`) hoje aparece como texto corrido + `Badge` no footer
(dono, 2026-10-01): sem identidade visual, sem listar o que só root faz, e sem
dizer o que cada nível pode/não pode fazer. Fonte da verdade: níveis e ações
exclusivas em `app/modules/admin/policies.py` + `router.py` (`current_root` só
em `POST /staff/{id}/grant|revoke`).

## What Changes

- **S1** `Crown` em `lib/icons.tsx` (regra de ouro; lucide tem).
- **S2** `components/admin/root-badge.tsx`: card "Modo Root" (coroa + "Acesso
  total ao sistema" + chevron, borda lateral de destaque) + variante compacta.
- **S3** Menu do usuário no footer (`app-sidebar.tsx`): card + grupo "Ações
  root" (Grant staff, Revoke staff → `/admin/users`), **só** `isRoot(me)`.
- **S4** Coroa nos botões Grant/Revoke staff da tabela Users (+ `aria-label`
  "somente root"). Grupo Administration sem coroa (é staff, não root).
- **S5** Card "Níveis de acesso" em `AdminUsersPage` (matriz root/staff/comum
  × capacidades) + `capabilitiesFor()` pura em `services/admin.ts` (espelho
  de `policies.py`, testada).
- **S6** CHANGELOG + padrão do badge em `DESIGN.md`.
- **S7** Gates + prova no card 17 se couber shell.

## Capabilities

### New Capabilities

- Nenhuma (feature de app, não item de catálogo).

### Modified Capabilities

- `lab-harness`: nenhuma (shell segue o padrão S7).

## Impact

- Novos: `components/admin/root-badge.tsx`, change `root-mode`.
- Alterados: `lib/icons.tsx`, `app-sidebar.tsx`, `pages/admin/Users.tsx`,
  `services/admin.ts`, CHANGELOG, `DESIGN.md`.
- **Intocados**: backend, tokens, rotas, permissões reais (só superfície).

## Non-goals

Mudar qualquer regra de autorização; coroa no grupo Administration;
cadeado (dono escolheu testar coroa).

## Acceptance criteria

1. Root vê card + ações root no menu do usuário; não-root vê zero.
2. Grant/Revoke com coroa e aria; matriz confere com `policies.py`.
3. Gates: `tsc -b`, `oxlint`, vitest, `vite build` verdes.
