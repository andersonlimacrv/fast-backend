## Context

Pós-Fase 5: outbox/Taskiq prontos, auth/tenancy/RBAC auditáveis em tese, mas nada registra; logs são texto solto sem correlação; backup é manual e nunca testado.

## Goals / Non-Goals

**Goals:**
- Rastro append-only das ações sensíveis, legível por admin da org.
- Correlação request-id fim a fim nos logs.
- Backup/restore reproduzível por um comando + drill automatizado.

**Non-Goals:**
- Métricas/tracing (diferidos por proporcionalidade), PITR, backup de storage de objetos.

## Decisions

1. **Recorder via `core/contracts/audit.py`, implementação em `modules/audit`, injeção em `main.py`** — core services recebem `audit: AuditRecorder | None = None`; zero import reverso (prova do DAG). Alternativa rejeitada (eventos via outbox p/ auditoria): indirection assíncrona complica os testes de aceite sem benefício no v1.
2. **Append-only por construção**: sem `update`/`delete` no service, sem rotas de escrita além do recorder interno; `metadata` JSONB p/ contexto livre; IP/UA capturados no router (service recebe pronto — services não veem `Request`).
3. **Leitura `admin+` e tenant-scoped** — `member` → 403; rows filtradas por `org_id` (superuser fora do v1).
4. **Request-id via middleware + `contextvars`** — gera UUID quando ausente, ecoa no response, `logging.Filter` injeta em todo record; sem structlog (dep a menos).
5. **Backup `pg_dump --format=custom → gzip → openssl enc -aes-256-cbc -pbkdf2`** — custom-format permite `pg_restore` seletivo; passphrase por env (`BACKUP_PASSPHRASE`), nunca em disco; destino `file://` local ou `s3://` (reuso do `ObjectStorage` p/ upload do artefato — primeira consumidora real do contrato de storage).
6. **Drill no teste, não no README** — `test_backup_drill` (`slow`): seed via API → backup → `DROP SCHEMA public CASCADE` → restore → seed legível de volta.

## Risks / Trade-offs

- [Audit inline adiciona 1 INSERT por ação sensível] → aceitar (tabela estreita, índice por org+tempo); batch futuro se virar gargalo.
- [Backup criptografado perde-se sem passphrase] → documentar guarda fora do repo; teste usa passphrase fixa de teste.
- [Restore derruba conexões] → drill usa banco de teste dedicado; runbook avisa janela em produção.
- [Alternativa rejeitada: triggers PG p/ auditoria] → lógica fora do código, invisível p/ agentes e testes; não.
