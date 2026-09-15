## Why

O `/client` abre direto no Dashboard logado (`App.tsx:38` index) e não tem página pública: não há onde documentar módulos, flags e release como uma landing de framework, nem para onde mandar quem não tem sessão. Com `GET /meta` (change 1) existe fonte de verdade para isso.

## What Changes

- `LandingPage` pública em `/` (layout público próprio, sem sidebar logada): hero (nome + versão via `/meta`, selo de status via `/healthz`), grade de módulos (descrição curta + selo habilitado/não-habilitado), seção release, CTAs Login → `/login` e Criar conta → `/register`. **Fallback estático** se o backend estiver fora (landing sempre renderiza + selo "backend offline").
- `DashboardPage` (overview da sessão) muda para `/~`; logado em `/` redireciona p/ `/~`; `Protected` sem sessão redireciona p/ `/` (antes `/login`); `ROUTES.app = "/~"`.
- Camadas (`pages → hooks → services → lib`): `getMeta()` + `MetaRead` em `lib/api`; `services/meta.ts` (normalização + fallback puros e testados); `hooks/useMeta.ts`; `pages/Landing.tsx`.
- Acessibilidade pelo runbook `web-design-guidelines` (landmarks, foco, labels, `prefers-reduced-motion`).

## Capabilities

### New Capabilities

- `client-landing`: landing pública documentando módulos/flags/release + home logada em `/~`.

### Modified Capabilities

- Nenhuma. Backend consumido como está (só leitura de `/meta` + `/healthz`).

## Impact

- Só `client/src/**` (+ `client/README.md`); nenhuma dependência nova; nenhum endpoint muda.
- Risco: `~` em path — char unreserved, React Router v7 suporta; aceite cobre navegação direta.

## Non-goals (v2 §21)

Login modal/two-step (change 3); exibir dados pessoais; analytics/trackers (zero terceiros — `index.html` não tem CDN); testes de componente (só units puros + gates).

## Acceptance criteria (visual, backend ligado e desligado)

1. Anônimo em `/`: hero com versão real, módulos com selos batendo com `.env` (billing off por padrão), CTAs funcionam.
2. Backend desligado: landing renderiza com fallback + selo offline (sem tela em branco/erro).
3. Logado em `/` → `/~` (overview da sessão); sem sessão em `/~` → `/`; `/login` e `/register` continuam.
4. `npm run build/lint/test:run` verdes; `grep "@/lib/api" client/src/pages` vazio; teclado + leitor (landmarks/labels) sãos.
