## 1. Transporte (`lib/`)

- [x] 1.1 `api.ts`: `is_staff` em `UserRead` + wire types admin (`AdminUserRead/Overview/OrgRead/AuditRead/StatusAccepted`) + 13 fns (overview, users CRUD-ação, staff grant/revoke, orgs, memberships set/remove com body em DELETE, audit)
- [x] 1.2 `constants.ts`: `ROUTES.admin*` (+ link de reset? não — sem link em tela, só `FRONTEND_URL` no backend)

## 2. Domínio + hooks (padrão `grants`/`useAudit`)

- [x] 2.1 `services/admin.ts`: wrappers finos + `normalizeReason` puro (trim; `null` se <8) + `admin.test.ts` no padrão `grants.test.ts`
- [x] 2.2 Hooks `useAdminOverview/Users/Orgs/Audit` sobre `useAsync`/`useCollection` (+ testes no padrão `useAsync.test.tsx` onde couber)

## 3. Páginas + rotas + gate UX

- [x] 3.1 `RequireStaff` (403 amigável via `ErrorBox`, sem prometer segurança client-side) + rotas `/admin*` em `App.tsx` sob `Protected`
- [x] 3.2 `AdminOverview` (cards + links), `AdminUsers` (tabela + criar + 5 ações com reason + confirm nas sensíveis), `AdminOrgs` (orgs + memberships), `AdminAudit` (trail global, root-only)
- [x] 3.3 Nav "Admin" condicional em `layout.tsx` (`is_staff || is_superuser`); `PageHeader` de cada página cita o contrato (`GET /admin/...`)

## 4. Docs + gates

- [x] 4.1 `client/README.md`: seção admin (pré-req root via `make admin-bootstrap`, fluxos, 403s esperados)
- [x] 4.2 `npm run build`, `npm run lint`, `npm run test:run` verdes; `make web-lint web-test web-build` ok; `grep "@/lib/api" client/src/pages` vazio
- [x] 4.3 Aceite visual 1–5 da proposal contra backend real (root + member); `openspec verify` antes de `archive`
