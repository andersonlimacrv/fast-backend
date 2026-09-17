# client-routing-structure — tasks

## S0 — Change (esta change)

- [x] 0.1 `client/openspec/changes/client-routing-structure/{proposal,tasks,design}.md` + aprovação do dono

## S1 — Settings + layouts base (eu)

- [x] 1.1 `SettingsPlaceholder` (App.tsx) → `pages/settings/Settings.tsx` como `SettingsPage`; App importa da pasta
- [x] 1.2 Gate `Protected` (App.tsx) → `layouts/protected-layout.tsx`; App usa o layout

## S2 — auth split (eu)

- [x] 2.1 `Auth.tsx` → `auth/Login.tsx` (`LoginPage`) + `auth/Register.tsx` (`RegisterPage`); imports mínimos por arquivo; App atualiza

## S3 — admin (eu)

- [x] 3.1 `AdminOverview|Users|Orgs|Audit.tsx` + `Gallery.tsx` → `admin/` (git mv, nomes intactos); App atualiza

## S4 — orgs + dinâmica (eu)

- [x] 4.1 `Orgs.tsx` → `orgs/Orgs.tsx`; `Members.tsx` → `orgs/[orgId]/Members.tsx`; App atualiza
- [x] 4.2 Auditar: `MembersPage` segue usando `activeOrgId` do contexto (nunca `:orgId` da URL)

## S5 — projects (eu)

- [x] 5.1 `Projects.tsx` + `Projects.test.tsx` → `projects/`; import do teste atualizado

## S6 — singles em pastas (eu)

- [x] 6.1 `Dashboard|Health|Account|Grants|Audit|Landing|NotFound.tsx` → `overview|health|account|grants|audit|landing|not-found/`; App atualiza

## S7 — Docs + verificação (eu)

- [x] 7.1 `docs/CLIENT-STRUCTURE.md` (PT-BR) + `docs/adr/0013-client-routing-structure.md`
- [x] 7.2 **APRESENTAR árvore/diff ao dono ANTES dos gates** (ordem permanente)
- [x] 7.3 Gates: `tsc+build`, vitest 102, e2e 16/16, `oxlint` (só warnings pré-existentes); `security-auditor` no dinâmico
- [x] 7.4 Sem commit sem pedido
