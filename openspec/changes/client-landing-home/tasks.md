## 1. Transporte + domínio

- [x] 1.1 `lib/api.ts`: `MetaRead` + `getMeta()` (GET `/meta`, sem auth)
- [x] 1.2 `services/meta.ts`: `normalizeMeta` (descrições por key + fallback p/ desconhecida) + `DEFAULT_META` offline + `meta.test.ts` (padrão `grants.test.ts`)
- [x] 1.3 `hooks/useMeta.ts`: `useAsync` paralelo `getMeta` + `getHealthz` → `{meta, backendUp}`

## 2. Páginas + rotas

- [x] 2.1 `pages/Landing.tsx`: header público, hero, grade de módulos, release, CTAs (landmarks/labels, `prefers-reduced-motion` respeitado pelo CSS existente)
- [x] 2.2 `App.tsx`: index → `LandingPage` (pública); `path="~"` → `DashboardPage` (em `Protected`); `Protected` → `/`; `*` → `/`
- [x] 2.3 `constants.ts`: `ROUTES.app = "/~"` (+ `ROUTES.home` segue `/` = landing)

## 3. Docs + gates

- [x] 3.1 `client/README.md`: seção da landing (offline-first, rotas)
- [x] 3.2 `npm run build/lint/test:run` verdes; `grep "@/lib/api" client/src/pages` vazio
- [x] 3.3 Aceite visual 1–4 (backend on/off, logado/anônimo, teclado); `openspec verify` antes de `archive`
