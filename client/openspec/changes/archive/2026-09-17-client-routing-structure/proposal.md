## Why

`client/src/pages/` tem 17 arquivos flat (`Auth.tsx` com 2 páginas, `Projects.tsx`
com página + teste, placeholder de Settings dentro de `App.tsx`, gate `Protected`
inline). Rota e arquivo não se correspondem — localizar `orgs/[orgId]/members`
exige adivinhar. O dono pediu espelho endereço→pasta (estilo Next, sem
`index.tsx`) agrupado por acesso (auth, admin, orgs/, …), com regra de projeto
documentada e rotas dinâmicas recebendo params sob direitos já auditados.

## What Changes

- Pastas espelhando `ROUTES`: `auth/`, `admin/`, `orgs/`, `orgs/[orgId]/`,
  `projects/`; singles em pastas próprias (`health/`, `account/`, …);
  `~`→`overview/`, `/`→`landing/`, `*`→`not-found/` (exceções mapeadas).
- Sem `index.tsx`/barrel: arquivo mantém o nome/componente atual; imports
  diretos (só `App.tsx` + `Projects.test.tsx` tocam `@/pages/*`).
- `SettingsPlaceholder` sai do `App.tsx` → `pages/settings/Settings.tsx`;
  gate `Protected` sai do `App.tsx` → `layouts/protected-layout.tsx`.
- Regra de autoridade inalterada e documentada: segmento dinâmico nunca é
  autoridade (`MembersPage` usa `activeOrgId` do contexto, não `:orgId`).
- Docs: `docs/CLIENT-STRUCTURE.md` (PT-BR) + ADR-0013.

## Capabilities

### New Capabilities

- `client-routing-structure`: mapa rota→pasta→layout + checklist de rota nova.
- `route-layout-groups`: público (sem layout) vs protegido+dashboard.

### Modified Capabilities

- `admin-dashboard-shell`: imports de páginas por pasta (rotas/URLs intactas).

## Impact

- `client/src/{pages,layouts}/`, `App.tsx`, 1 import de teste, docs + ADR.
  Zero `app/`; zero deps; zero mudança de URL, API ou direitos.

## Non-goals

- Migrar para Next/App Router; renomear componentes; mudar direitos;
  reformular conteúdo das páginas (só a reforma de headers já aprovada);
  e2e novos (specs usam URLs, seguem verdes).

## Acceptance criteria

1. `git mv` preserva histórico; nenhum import `@/pages/*` fora de `App.tsx`/testes.
2. `tsc`, vitest 101/101, e2e full verde sem mudança de comportamento.
3. `security-auditor` confirma: autoridade segue contexto/membership.
4. Apresentado ao dono antes dos gates (ordem permanente dele).
