## Context

Pós-Fase 7: 89 testes, 18 capabilities, zero empacotamento. Deploys manuais copiando `.env` por SCP são o risco restante. Alvo: VPS single-host, GHCR como registry, SSH como transporte.

## Goals / Non-Goals

**Goals:**
- `main` verde vira imagem imutável deployável por pipeline, com volta automática.
- Qualquer dev gera um projeto filho funcional com um comando.

**Non-Goals:**
- Orquestração, zero-downtime garantido, multi-ambiente além de local/prod.

## Decisions

1. **Imagem por SHA, nunca `:latest`** (v2 §15) — `rollback = up` na SHA anterior gravada em `.deploy-state` no VPS; `latest` nem é publicado.
2. **Deploy em Python testável (`scripts/deploy.py`), workflows finos** — a lógica (tags, healthcheck-gate, decisão de rollback) tem testes; o YAML só orquestra. SSH via `appleboy/ssh-action`? Não — `ssh` direto com chave ed25519 (menos magic, auditável).
3. **Migrate como serviço one-shot do compose** (`migrate: alembic upgrade head`, `depends_on` db healthy) — app/worker sobem depois (`depends_on: migrate completed`). Sem init-container exótico.
4. **Worker = `taskiq worker app.worker:broker`** — `worker.py` monta broker por env e registra `send_email`; `concurrency` via flag do CLI.
5. **Compose local espelha prod nos serviços de dados** (mesmas imagens postgres:16/redis:7) — paridade onde importa; mailpit/minio em `profiles: [tools]`.
6. **Template = cópia + renome, não cookiecutter** — sem templating engine (Jinja em nomes de arquivo é overengineering p/ v1); script lista exclusões e valida o output.
7. **TLS fora do compose** — snippet Caddy no runbook; terminar TLS no compose acoplaria domínio ao repo.

## Risks / Trade-offs

- [Healthcheck pós-deploy com cold-start] → `readyz` com retries (30×10s) antes de declarar falha e reverter.
- [Migrate incompatível com código antigo durante rolling] → estratégia expand/contract documentada; v1 assume janela curta single-host (stop/start, não rolling).
- [GHCR exige login no VPS] → `GITHUB_TOKEN` com `packages:write` no workflow + `read:packages` no VPS via deploy key/token de leitura.
- [Alternativa rejeitada: Kamal/Dokku] → mais camadas p/ um host; compose+ssh basta.
