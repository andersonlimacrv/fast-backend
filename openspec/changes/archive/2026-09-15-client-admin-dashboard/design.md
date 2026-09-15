## Context

Backend Fase 9 pronto e verificado (122 testes, 33 rotas no OpenAPI, changes `A/B/C` arquivadas). Client em camadas (`pages → hooks → services → lib`, change `client-frontend-architecture`) com toasts tipados + `confirm` (change `client-toast-notify`), cobrindo 23/26 rotas — faltam só as 13 de admin + `is_staff` no `UserRead`. Páginas-modelo: `Members.tsx` (tabela + ações por linha) e `Audit.tsx` (trail + `normalizeAuditRow`).

## Goals / Non-Goals

**Goals:** operar todo o control plane pela UI com o mesmo rigor do backend (`reason` sempre, confirmação no sensível, sem segredo em tela), sem tocar `app/`.
**Non-Goals:** nova arquitetura, novas deps, testes de componente, backend.

## Decisions

1. **4 páginas espelhando os grupos do backend** (`/admin`, `/admin/users`, `/admin/orgs`, `/admin/audit`) em vez de 1 CRUD gigante — cada página tem um escopo de autorização claro (staff vs root-only no audit e grant/revoke), igual ao backend (`admin/router.py`, ADR 0005 §7).
2. **`RequireStaff` como UX, não como segurança** — `user.is_staff || user.is_superuser` vindo de `/auth/me` (exige `is_staff` no wire type); backend continua autoridade (`friendlyError` 403 + dica). Rejeitado: esconder rotas sem guarda (deep-link quebraria mudo).
3. **`reason` como campo de formulário obrigatório** (não `prompt()`) — validado inline pelo helper puro `normalizeReason` (testável como `parseGrantLimit`); erro de validação em `ErrorBox`, sucesso/erro de rede em toast (`notify.fromError`). Rejeitado: toast para erro de formulário (convenção `notify.ts:1` — toasts só p/ feedback global).
4. **`notify.confirm` nas 5 ações sensíveis** (disable, revoke-sessions, force-reset, staff grant/revoke) — destrutivas ou de privilégio; create/enable/membership-set vão direto + toast. Segue a semântica do toast-system (`confirm` com ação).
5. **Reusar `normalizeAuditRow`** para o audit global — o alias `audit_metadata` é o mesmo do endpoint por-org; sem duplicar normalização.
6. **Sem estado global novo** — hooks locais (`useCollection`/`useAsync`) por página; `AuthContext` só ganha `is_staff` via tipo (sem mudança de comportamento).

## Risks / Trade-offs

- [Staff vê PII (emails) na tabela → paginação via `limit/offset` + aviso "dev visualization only" já no footer] → sem export CSV.
- [DELETE com body pode estranhar proxies → backend já aceita; aceite visual cobre o fluxo remove-membership] → se falhar, fallback documentado (não mudar backend nesta change).
- [Root/staff sem org ativa: páginas admin independem de `activeOrgId` (escopo global)] → diferente de Members/Audit por-org; documentado no `PageHeader` de cada página.

## Migration Plan

Aditiva em `client/src` (arquivos novos + `api.ts/constants.ts/App.tsx/layout.tsx` estendidos). Sem migração de dados; rollback = reverter commit. `client/README.md` ganha seção admin.

## Open Questions

- Nenhuma bloqueante. Paginação além de `limit=100` default fica para follow-up com data-table unificado (non-goal registrado).
