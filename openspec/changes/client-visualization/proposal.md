## Why

O backend v1.0.0 está entregue sem nenhuma visualização: validar fluxos de auth, troca de organização, projects, grants e audit hoje exige `curl`/Swagger. Uma SPA de visualização em `/client` permite testar em tela o que o backend retorna, acelerando o feedback antes de qualquer frontend definitivo.

## What Changes

- Cria pasta isolada `/client/` (Vite + React + TypeScript, **não Next.js**) fora de `app/`, sem tocar no DAG Python.
- Configura Tailwind CSS v4 (CSS-first via `@tailwindcss/vite`) + shadcn (`new-york`, alias `@/*`) + variáveis tweakcn (oklch, `dark` via classe).
- Implementa shell de visualização com rotas: `/health`, `/login`, `/register`, `/`, `/orgs`, `/orgs/:id/projects`, `/orgs/:id/members`, `/orgs/:id/grants`, `/orgs/:id/audit`.
- Implementa cliente HTTP (`VITE_API_URL`) com refresh rotation ciente (401 → refresh 1x → retry; reuse → logout forçado) e seletor de `active_org_id` via `POST /auth/switch-organization`.
- Documenta `CORS_ORIGINS` local para dev Vite (`http://localhost:5173`) e registra triagem de skills de frontend no `docs/SKILLS-REGISTRY.md`.
- **Non-goals (v2 §21)**: sem SSR/Next.js, sem design system definitivo, sem Stripe checkout/portal, sem RLS, sem OTel, sem alterar contratos `app/` (somente leitura via HTTP).

## Capabilities

### New Capabilities

- `client-visualization`: SPA de visualização que lista e exercita os contratos HTTP existentes (health, auth, organizations, projects, grants, audit) contra backend rodando, sem lógica de negócio no frontend.

### Modified Capabilities

- Nenhuma. Nenhum REQUIREMENT existente em `openspec/specs/` muda; backend é consumido como está.

## Impact

- Novo: `/client/**` (package.json, vite.config.ts, `src/`), `docs/SKILLS-REGISTRY.md` (1 linha de triagem), `.env.example` (comentário `CORS_ORIGINS` para dev — sem mudar default).
- Sistemas: dev exige backend rodando (`docker-compose up postgres/redis`, `alembic upgrade head`, `uvicorn`) + `VITE_API_URL` apontando para ele.
- Riscos: `CORS_ORIGINS=[]` bloqueia o Vite até configurado; `reuse` de refresh derruba a family (comportamento esperado, exibir como logout); `TENANCY_MODE`/`BILLING_ENABLED` reais só confirmados com backend no ar.
- Auth/tenancy seguem referência congelada (v2 §3/§6) e ADRs 0001/0002: `active_org_id` é contexto, autoridade = membership Postgres.

## Acceptance (visual, contra backend real)

- `GET /healthz` e `/readyz` exibidos na tela Health com backend via `docker-compose`.
- Login → `/auth/me` → criar org → switch-org → criar/listar project com Postgres real; 401 com token expirado recupera via refresh sem relogar.
