## 1. Skills e pré-requisitos

- [ ] 1.1 Registrar triagem em `docs/SKILLS-REGISTRY.md` (`vercel-react-best-practices` + `vite-shadcn-tailwind4` como referência, SHA/tag, escopo `/client`, risco, dono)
- [ ] 1.2 Conferir `node --version` (>=20) e definir `npm` como default
- [ ] 1.3 Subir backend real (`docker-compose up -d postgres redis`, `uv sync --extra dev`, `alembic upgrade head`) e anotar `VITE_API_URL` + `CORS_ORIGINS`

## 2. Scaffold Vite isolado

- [ ] 2.1 Criar `/client` com `npm create vite@latest client -- --template react-ts` (sem Next, sem tocar `app/`)
- [ ] 2.2 Instalar `tailwindcss@^4 + @tailwindcss/vite`, `react-router-dom`, `clsx + tailwind-merge + lucide-react`
- [ ] 2.3 Configurar `vite.config.ts` (plugin tailwind + alias `@` → `src`) e `tsconfig` paths

## 3. Tailwind v4 + shadcn + tweakcn

- [ ] 3.1 Escrever `src/index.css` CSS-first (`@import "tailwindcss"`, `@theme` oklch, `@custom-variant dark`, bloco tweakcn `:root/.dark` com `--background/--primary/--radius/--chart-*/--sidebar-*`)
- [ ] 3.2 Inicializar shadcn `new-york` (`components.json`, `lib/utils.ts`) e adicionar Button/Input/Card/Dialog/Select/Table/Sonner
- [ ] 3.3 Validar `npm run dev` renderiza tokens claro/escuro via toggle `.dark`

## 4. Cliente HTTP e auth

- [ ] 4.1 Criar `lib/api.ts` (`VITE_API_URL`, `Authorization: Bearer`, refresh único em voo + retry 1x, reuse→logout)
- [ ] 4.2 Criar `AuthContext` (`login/register/me/refresh/logout/logout-everywhere/change-password/switch-organization`, `active_org_id` visível)
- [ ] 4.3 Criar rotas `/login`, `/register`, `/` protegida e guarda de 401

## 5. Telas de visualização

- [ ] 5.1 Tela `/health` (`/healthz` + `/readyz` com `db/redis`, erro de conexão/CORS legível)
- [ ] 5.2 Telas orgs (`list/create/get`, seletor de org ativa via switch)
- [ ] 5.3 Tela members (`list/add/change-role/remove` com mensagens 403)
- [ ] 5.4 Tela projects (`list/create/rename/delete`, aviso de entitlement em 403)
- [ ] 5.5 Telas grants (`list/upsert`) e audit (`list limit 100`) para admin

## 6. Verificação

- [ ] 6.1 `npm run build` + `tsc --noEmit` verdes em `/client`
- [ ] 6.2 Fluxo manual contra backend real: login → me → criar org → switch → criar project → grants → audit
- [ ] 6.3 `git status --short` mostra só `/client/ + openspec/ + docs/SKILLS-REGISTRY.md`; backend `ruff/mypy/lint-imports` intactos
