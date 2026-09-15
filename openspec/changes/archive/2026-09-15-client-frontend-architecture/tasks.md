## 0. Repo fixes descobertos no caminho

- [x] 0.1 `.gitignore`: ancorar `lib/` → `/lib/` (+ `lib64/`) — padrão Python engolia `client/src/lib/`
- [x] 0.2 `make e2e`: promover fluxo E2E a `scripts/e2e_spa_flow.py` + target (tudo via make)

## 1. Fundação (lib + session)

- [x] 1.1 `src/lib/constants.ts` (API_BASE, STORAGE_KEYS, SESSION_EVENT, ROUTES, ROLES, AUDIT_LIMIT)
- [x] 1.2 `src/lib/api.ts`: extrair storage/evento p/ callback `onUnauthorized` injetado (default lança; session injeta)
- [x] 1.3 `src/services/session.ts` (get/set/clearTokens, org, notify/onSessionExpired)

## 2. Services de domínio

- [x] 2.1 `orgs.ts`, `projects.ts`, `members.ts` (assinaturas estáveis sobre o transporte)
- [x] 2.2 `grants.ts` (parseGrantLimit com tabela de casos) + `audit.ts` (normalizeAuditRow: metadata|audit_metadata)
- [x] 2.3 `health.ts` (getHealthz/getReadyz + tipos)

## 3. Hooks + contexts + external

- [x] 3.1 `hooks/useAsync.ts` (execute/data/error/loading/reload + guarda unmount) + `useCollection.ts`
- [x] 3.2 `useProjects/useOrgs/useMembers/useGrants/useAudit/useHealth.ts`
- [x] 3.3 `contexts/AuthContext.tsx` (move de `auth/`, usa services/session); remover `src/auth/`; `App.tsx` atualiza import
- [x] 3.4 `external/theme.ts` (isDark/applyTheme/toggle) + layout usa

## 4. Migração das páginas (comportamento idêntico)

- [x] 4.1 Projects, Orgs, Members (useCollection + services)
- [x] 4.2 Grants (service parse), Audit (service normalize), Health (useHealth), Account (context + service), Auth/Dashboard/Layout (imports constants/contexts)

## 5. Vitest + gates

- [x] 5.1 devDeps pinadas (`vitest`, `@testing-library/react`, `jsdom`?) + `test`/`test:run` + config; `import.meta.env` stub se preciso
- [x] 5.2 Testes: grants.parse, audit.normalize, session round-trip+evento, useAsync (data/error/reload)
- [x] 5.3 `npm run build` + `lint` + `test:run` verdes; `grep "@/lib/api" src/pages` vazio
- [x] 5.4 Make `web-lint/web-test/web-build` + `.PHONY` + manual EN/PT-BR em par
- [x] 5.5 E2E 15/15 verde; `git status` só previstos, sem segredo
