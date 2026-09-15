## Why

A SPA `/client` (PR #1) funciona mas nasceu sem arquitetura: `AuthContext` fora de convenção (`src/auth/`), 6 páginas duplicando o trio load/error/busy (~30 linhas cada), páginas chamando transporte (`@/lib/api`) direto, `api.ts` misturando fetch + `localStorage` + evento DOM, strings mágicas espalhadas (`NAV`, `ROLES`, storage keys, `"fb:session-expired"`), `ThemeToggle` inline no layout e zero testes. `src/lib/api.ts` + `utils.ts` (change anterior) cobrem só o transporte. Sem camadas, a próxima feature copia o boilerplate pela sétima vez.

## What Changes

- `src/lib/constants.ts`: `API_BASE`, `STORAGE_KEYS`, `SESSION_EVENT`, `ROUTES`, `ROLES`, limites.
- `src/lib/api.ts`: transporte puro (fetch, `ApiError`, wire types) — `localStorage`/`window` saem para service, com `onUnauthorized` injetado.
- `src/services/`: `session.ts` (tokens/org + evento) + 6 domínios finos com trabalho real (grants: parse de limit; audit: normaliza `metadata|audit_metadata`; resto: assinatura estável).
- `src/hooks/`: `useAsync` (genérico, com guarda de unmount) + `useCollection` + 6 hooks de domínio.
- `src/contexts/AuthContext.tsx`: move de `src/auth/` (apagado), sobre services.
- `src/external/theme.ts`: dark-mode do layout.
- 9 páginas + layout migrados para hooks/services (comportamento idêntico).
- Vitest + Testing Library (devDeps pinadas), scripts `test`/`test:run`, testes de services/hooks.
- Make: `web-lint`, `web-test`, `web-build` + manual EN/PT-BR em par.
- Regra de dependência documentada em `client/README.md`: `pages → hooks → services → lib`.

## Capabilities

### New Capabilities

- `client-architecture`: camadas, regra de import e gates do frontend.

### Modified Capabilities

- (vazio)

## Impact

- Só `client/` + `Makefile` + `docs/Makefile*.md`. Nenhum endpoint/payload muda; suite E2E 15/15 como rede.
- Novas devDeps pinadas no `client/package.json` (+ lockfile).
- `src/auth/` removido; imports `@/auth/*` viram `@/contexts/*`.

## Non-goals (v2 §21)

- Testes de páginas/componentes (MSW + router mock, follow-up); `data-table` unificado; nova feature; trocar shadcn `ui/`; React Query (sem nova dependência de runtime).

## Acceptance criteria

1. `grep "@/lib/api" client/src/pages` vazio; `ls client/src/auth` falha (dir removido).
2. `npm run build` (tsc+vite), `npm run lint` (oxlint), `npm run test:run` (vitest) verdes.
3. `make web-lint`, `make web-test`, `make web-build` funcionam via Git Bash e cmd.
4. E2E 15/15 continua verde ( endpoints/payloads intactos); `git status` sem segredo.
