## Why

Oito fases de código sem empacotamento: sem Dockerfile/Compose não há dev reproduzível nem deploy; sem runbook e template, o "boilerplate" não gera o segundo projeto (v2 §§15–16, ROADMAP Fase 8).

## What Changes

- `Dockerfile` multi-stage (`deps`, `dev` com reload, `migrate` com alembic, `prod` non-root) + `.dockerignore`.
- `docker-compose.yml` (local: postgres, redis, app, worker; mailpit/minio em profiles) + `docker-compose.prod.yml` (app+worker+migrate+postgres+redis, sem portas de dados expostas).
- `app/worker.py`: broker por env + tasks registradas; `taskiq worker app.worker:broker`.
- `scripts/deploy.py` (testável) + `.github/workflows/deploy.yml` (build `:sha` imutável → push GHCR → migrate → healthcheck `/readyz` → rollback automático p/ SHA anterior) + `rollback.yml` (dispatch p/ SHA).
- `scripts/new_project.py`: copia a árvore menos VCS/venvs/caches, renomeia projeto; teste prova bootstrap.
- Docs finais: `README.md` operacional, `docs/DEPLOYMENT.md` (runbook VPS + Caddy + backup cron), `CHANGELOG.md` (0.1.0).

## Capabilities

### New Capabilities

- `deployment`: imagem imutável, compose local/prod, deploy com healthcheck-gate e rollback.
- `project-template`: bootstrap de segundo projeto via script.

### Modified Capabilities

- (vazio)

## Impact

- Novos: `Dockerfile`, `.dockerignore`, 2 composes, `app/worker.py`, `scripts/{deploy,new_project}.py`, 2 workflows, 3 docs.
- Comportamento da API inalterado; `uvicorn app.main:create_app --factory` como entrypoint ASGI.
- CI existente intacto; deploy só roda em push na `main` (ou dispatch).

## Non-goals (v2 §21)

Kubernetes, multi-host, blue/green, CDN, managed DB, TLS dentro do compose (Caddy externo documentado).

## Acceptance criteria

1. `docker build` das 4 stages ok; prod sobe e `/healthz` responde sem DB.
2. `docker compose up` local sobe app+worker+db+redis (smoke, onde docker com bridge funcionar; aqui validado o essencial via build).
3. Deploy com `/readyz` falho faz rollback p/ SHA anterior (lógica testada em `scripts/deploy.py`).
4. `new_project.py` gera árvore bootável: estrutura + `pyproject` renomeado + `ruff check` limpo no output.
5. Docs respondem: o quê, como rodar, testar, buildar, deployar, backup, rollback.
