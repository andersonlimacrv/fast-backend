## Why

O backend da Fase 9 expõe o control plane (`GET|POST /admin/*`, `POST /auth/password/*` — changes `A/B`, specs `admin/recovery`), mas o `/client` não consome nada disso: cobre 23/26 rotas e nenhuma é admin. Operar contas hoje exige `curl` + `reason` manual, sem visibilidade de overview/users/audit global. Esta change dá ao client as telas de administração multi-projeto previstas desde a proposal A, consumindo o contrato backend-only como ele está.

## What Changes

- `src/lib/api.ts`: wire types `AdminUserRead` (+ `is_staff` em `UserRead`), `AdminOverview`, `AdminOrgRead`, `AdminAuditRead`, `StatusAccepted` + 13 funções de transporte (`overview`, `users`, `create/disable/enable/revoke-sessions/force-password-reset`, `staff grant/revoke`, `organizations`, `memberships set/remove`, `audit`). DELETE de membership com body JSON (`{reason}`).
- `src/services/admin.ts`: wrappers finos + helper puro `normalizeReason` (trim; válido se ≥8 chars — espelha `parseGrantLimit` de `services/grants.ts:7` como unidade testável).
- `src/hooks/`: `useAdminOverview`, `useAdminUsers`, `useAdminOrgs`, `useAdminAudit` sobre `useAsync`/`useCollection` (mesmo padrão de `useAudit.ts:4`).
- `src/pages/`: `AdminOverview` (`/admin`: cards users/orgs/projects + links), `AdminUsers` (`/admin/users`: tabela, criar, disable/enable, revoke-sessions, force-reset, grant/revoke staff), `AdminOrgs` (`/admin/orgs`: orgs + set/remove membership), `AdminAudit` (`/admin/audit`: trail global, root-only). Toda mutação pede `reason` inline (erro inline via `ErrorBox`, nunca só toast); disable/revoke/grant/force-reset pedem confirmação via `notify.confirm`.
- Gate UX `RequireStaff` (só esconde/mostra; autoridade continua o backend — 403 vira `ErrorBox` com dica "requires staff/root" via `friendlyError` existente). Nav "Admin" visível se `user.is_staff || user.is_superuser`. `ROUTES.admin*` em `constants.ts`.
- Testes vitest do helper puro + hooks novos no padrão existente; `client/README.md` (fluxos admin + `make admin-bootstrap` para criar o root de teste).

## Capabilities

### New Capabilities

- `client-admin`: telas de administração (overview, users, orgs, audit global) sobre `GET|POST /admin/*`, com `reason` obrigatório e confirmação em ações sensíveis.

### Modified Capabilities

- Nenhuma. Nenhum REQUIREMENT existente muda; backend consumido como está (sem `app/` nesta change).

## Impact

- Só `client/src/**` (+ `client/README.md`); nenhum endpoint/payload muda; sem nova dependência de runtime (sem React Query — regra das changes client).
- Sistemas: dev exige backend rodando **com `ADMIN_ENABLED=true` + migrações até `0008`** e um root/staff (`make admin-bootstrap`); usuário comum vê as rotas negadas (403 esperado, exibido como `ErrorBox`).
- Riscos: `AuditRead` serializa metadata como `audit_metadata` (alias) — reutilizar `normalizeAuditRow` de `services/audit.ts:14`; DELETE com body funciona no `fetch` mas confirmar em todos os browsers-alvo no aceite visual.

## Non-goals (v2 §21)

Sem alterar contratos `app/`; sem impersonation; sem suspensão de org (não existe no backend); sem exibir token/link de reset (backend nunca retorna); sem testes de páginas/componentes (MSW, follow-up já registrado); sem trocar `ui/` shadcn; sem data-table unificado.

## Acceptance criteria (visual, contra backend real com root)

1. Login como root → nav "Admin" visível → `/admin` mostra contagens reais (users/orgs/projects); como member, nav oculta e acesso direto mostra 403 esperado.
2. `/admin/users`: criar user (com reason) → aparece na lista; disable → login dele dá 401; enable → volta; revoke-sessions → `me` dele dá 401; force-reset → `{status:accepted}` sem segredo na tela; grant staff como root → 200; como staff → 403.
3. `/admin/orgs`: set membership member → remove → último owner negado (409 esperado).
4. `/admin/audit` (root): lista trail global com `reason`; como staff → 403 esperado.
5. Mutação sem `reason` (ou <8 chars) nem chega ao backend (validação inline); 422 do backend vira `ErrorBox`, nunca toast mudo.
6. `npm run build`, `npm run lint`, `npm run test:run` verdes; `make web-lint web-test web-build` ok; `grep "@/lib/api" client/src/pages` continua vazio.
