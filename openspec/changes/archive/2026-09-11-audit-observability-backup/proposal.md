## Why

Operações sensíveis (login, troca de papel, grants, ban) hoje não deixam rastro; sem request-id o debug em produção é às cegas; sem backup testado, perda de banco é perda de negócio (v2 §§11–14, ROADMAP Fase 6).

## What Changes

- `core/contracts/audit.py`: `AuditRecorder` Protocol (`record(...)`); `modules/audit/`: `AuditLog{tenant_id,actor_user_id,action,resource_type,resource_id,metadata,ip,user_agent}` append-only (sem update/delete em nenhum nível), `AuditService` (implementa o recorder + `list_for_org`), `public.py`, router `GET /organizations/{id}/audit` (`admin+`, tenant-scoped).
- Instrumentação via injeção no `main.py` (dependência invertida — nenhum core importa `audit`): login/logout-global/troca-senha, org create, member add/remove/role, grant upsert.
- Observabilidade: middleware `X-Request-ID` (gera/propaga) + logs estruturados com request-id via `contextvars` (sem dep nova); métricas ficam diferidas (proporcionais).
- `scripts/backup.py`: `pg_dump → gzip → openssl enc → destino local/S3` + prune por retenção; teste de restore drill de verdade (dump → drop → restore → dados de volta).
- Migration `0005_audit`.

## Capabilities

### New Capabilities

- `audit`: append-only + leitura admin + recorder plugado nos serviços.
- `observability`: request-id + logs estruturados.
- `backup`: script + retenção + drill.

### Modified Capabilities

- (vazio)

## Impact

- Novos: `app/core/contracts/audit.py`, `app/modules/audit/`, `app/infrastructure/observability/`, `scripts/backup.py`, migration 0005.
- Comportamento: responses ganham `X-Request-ID`; tabelas novas; nenhum fluxo existente muda de status.
- DAG: `audit` é folha (`→ tenancy` via public); composição em `main.py` injeta o recorder.

## Non-goals (v2 §21)

Prometheus/Grafana/OTel, RLS, SIEM, PITR contínuo, backup de objetos (só Postgres no v1).

## Acceptance criteria (Postgres real)

1. Login, troca de papel e grant geram linhas auditáveis com ator/recurso/IP; `member` não lê audit da org.
2. `UPDATE/DELETE` em `audit_log` não existem no código (grep no gate) e `X-Request-ID` aparece em responses + logs.
3. Drill: seed → backup → drop total → restore → seed de volta, em banco limpo.
4. `lint-imports` verde (audit folha, sem import reverso).
