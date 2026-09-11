# SCALING — fast-backend

> Knobs com defaults literais de `app/core/settings.py`. Ordem: esgotar o vertical antes de distribuir.

## 1. Vertical primeiro (single-host)

| Knob | Default | Quando mexer |
|---|---|---|
| `DB_POOL_SIZE` / `DB_MAX_OVERFLOW` | 5 / 10 (+`pool_pre_ping`) | pool esgotado sob carga (logs `QueuePool exaustion`) |
| Taskiq `--workers` (compose) | 2 | fila do outbox cresce (`pending` parado) |
| `ACCESS_TOKEN_TTL_MINUTES` | 15 | alta frequência de refresh onerando o banco |
| `LOGIN_MAX_ATTEMPTS` / `LOGIN_WINDOW_SECONDS` | 10 / 60 | brute force ou UX de login |
| `STORAGE_MAX_BYTES` | 10 MiB | uploads maiores |
| `OUTBOX_MAX_ATTEMPTS` | 5 | tarefas lentas marcadas `dead` cedo demais |
| Uvicorn `--workers` (prod) | 1 (default; subir no compose se CPU-bound antes do banco) | CPU-bound antes do banco |

## 2. Depois do vertical

1. **Réplicas de leitura Postgres** — só com invariantes claros (leitura eventual ok p/ listagens; escrita sempre no primário). Exige separar session factory (fora do v1).
2. **PgBouncer** — antes de RLS (`SET LOCAL` exige session pooling) ou com centenas de conexões.
3. **Cache** — não existe no v1 de propósito; introduzir por endpoint quente com invalidação explícita (nunca cache global).
4. **Split de módulos** — só quando um módulo tiver ciclo de deploy/equipe próprio; até lá, o monólito modular com DAG vence (ver ADR 0003).

## 3. Gatilhos futuros (não fazer agora)

- RLS: cliente exigir isolamento além de `WHERE tenant_id`.
- OTel/Prometheus: operação exigir SLOs (hoje: logs + `/healthz` + `/readyz`).
- Fila além do Taskiq/Redis: volume que justifique outro broker.
- Sharding/multi-region: bem depois de réplicas de leitura.
