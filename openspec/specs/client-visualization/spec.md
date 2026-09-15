# client-visualization Specification

## Purpose
Permitir que um operador visualize e exercite em tela (Vite SPA) todos os contratos HTTP do backend v1 contra um backend real rodando, sem reimplementar regras de negócio no frontend.
## Requirements
### Requirement: Health visível

A SPA SHALL exibir o resultado de `GET /healthz` e `GET /readyz` do `VITE_API_URL` configurado, mostrando `status/db/redis` sem exigir autenticação.

#### Scenario: Backend saudável

- **WHEN** o operador abre `/health` com `VITE_API_URL` apontando para backend no ar
- **THEN** a tela mostra `healthz: ok` e `readyz: ready (db ok, redis ok)`

#### Scenario: Backend fora do ar

- **WHEN** o `VITE_API_URL` está inalcançável
- **THEN** a tela mostra erro de conexão com a URL tentada, sem travar a SPA

### Requirement: Auth completa exercitável

A SPA SHALL permitir registrar, logar, ver `/auth/me`, trocar senha, logout e logout-everywhere, persistindo `access_token/refresh_token/active_org_id` apenas em `localStorage` de dev e enviando `Authorization: Bearer <access>`.

#### Scenario: Login recupera sessão via refresh

- **WHEN** o access expira e o operador navega com refresh válido
- **THEN** a SPA chama `POST /auth/refresh` uma vez, troca o par e repete a requisição original sem pedir login

#### Scenario: Reuse de refresh derruba sessão

- **WHEN** o backend responde 401 em `/auth/refresh` (reuse revogou a family)
- **THEN** a SPA limpa os tokens e redireciona para `/login` com mensagem "sessão invalidada"

### Requirement: Organizações e contexto de tenant

A SPA SHALL listar/criar organizações, listar/mostrar membros e trocar o contexto via `POST /auth/switch-organization`, exibindo o `active_org_id` em uso em todas as telas tenant-scoped.

#### Scenario: Troca de organização

- **WHEN** o operador seleciona outra org no seletor
- **THEN** a SPA chama `/auth/switch-organization{org_id}`, substitui o access e recarrega projects/grants/audit daquela org

#### Scenario: Sem membership

- **WHEN** o backend responde 403/404 por falta de membership
- **THEN** a SPA exibe "sem acesso a esta organização" em vez de stacktrace

### Requirement: Projects, grants e audit visíveis

A SPA SHALL listar/criar/renomear/apagar projects (`/projects`), listar/upsert grants (`/organizations/{id}/grants`) e listar audit (`/organizations/{id}/audit`), sempre no contexto da org ativa, exibindo erros 403 (RBAC/entitlement) de forma legível.

#### Scenario: Sem entitlement

- **WHEN** listar projects retorna 403 por falta de grant
- **THEN** a tela mostra "recurso bloqueado por entitlement" com o `org_id` atual

#### Scenario: Admin vê audit

- **WHEN** um admin abre a aba Audit da org ativa
- **THEN** a SPA lista os últimos eventos (`action/resource/actor`) com limite padrão 100

### Requirement: Isolamento do backend

A SPA SHALL viver apenas em `/client/`, sem importar `app/` e sem alterar contratos Python; a única acoplagem é HTTP + `VITE_API_URL` e comentário de `CORS_ORIGINS` para dev.

#### Scenario: Backend intacto

- **WHEN** a change é aplicada
- **THEN** `git status` mostra mudanças só em `/client/`, `openspec/`, `docs/SKILLS-REGISTRY.md` e comentário `.env.example`; `ruff/mypy/lint-imports` do backend continuam verdes

