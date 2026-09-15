## Context

`main.py:109-119` monta routers por flag (`admin_enabled`, `billing_enabled`); `health.py:49-54` prova o padrão de endpoint público sem deps. Release segue tags (registry `git-workflow-and-versioning`).

## Goals / Non-Goals

**Goals:** fonte única de verdade p/ landing; superfície mínima auditável; zero vazamento.
**Non-Goals:** qualquer telemetria, contadores, ambiente, PII.

## Decisions

1. **Rota em `app/interfaces/meta.py`** (não módulo) — metadado transversal, sem dono de domínio; segue `health.py`. Sem service, sem DB: lê `request.app.state.settings` (composição já injeta).
2. **Lista de módulos estática no código + flags do settings** — núcleo hardcoded `True` (espelha `main.py`); `admin`/`billing` dinâmicos. Rejeitado: introspecionar routers registrados (acopla a internals do FastAPI).
3. **`APP_VERSION` explícito, não `importlib.metadata`** — evita acoplar empacotamento; default = versão atual; CI/release injeta da tag.
4. **Sem throttle dedicado** — resposta estática barata sob headers/hardening globais; reavaliar se abusado (log `app.request` já dá visibilidade).

## Risks / Trade-offs

- [Versão desatualizada se release não injetar → teste de fumaça no deploy + CHANGELOG como registro humano] → documentado em DEPLOYMENT na change 4 se preciso.
- [Enumeração de módulos habilitados → aceito: flags de produto não são segredo; segredos/topologia continuam proibidos e testados].

## Migration Plan

Sem migração. Deploy: código + `APP_VERSION` no env de prod (opcional; default seguro).

## Open Questions

- Nenhuma bloqueante.
