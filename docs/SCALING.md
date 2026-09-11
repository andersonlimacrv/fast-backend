# SCALING — fast-backend

> 🇬🇧 English | [Português (BR)](SCALING.pt-BR.md)
>
> Knobs with literal defaults from `app/core/settings.py`. Order: exhaust vertical before distributing.

## 1. Vertical first (single-host)

| Knob | Default | When to touch |
|---|---|---|
| `DB_POOL_SIZE` / `DB_MAX_OVERFLOW` | 5 / 10 (+`pool_pre_ping`) | pool exhaustion under load |
| Taskiq `--workers` (compose) | 2 | outbox queue grows (`pending` stalls) |
| `ACCESS_TOKEN_TTL_MINUTES` | 15 | high refresh frequency burdens the DB |
| `LOGIN_MAX_ATTEMPTS` / `LOGIN_WINDOW_SECONDS` | 10 / 60 | brute force or login UX |
| `STORAGE_MAX_BYTES` | 10 MiB | larger uploads |
| `OUTBOX_MAX_ATTEMPTS` | 5 | slow tasks marked `dead` too early |
| Uvicorn `--workers` (prod) | 1 (default; raise in compose if CPU-bound before the DB) | |

## 2. After vertical

1. **Postgres read replicas** — only with clear invariants (eventual reads ok for listings; writes always on primary). Requires splitting the session factory (out of v1).
2. **PgBouncer** — before RLS (`SET LOCAL` needs session pooling) or with hundreds of connections.
3. **Cache** — absent from v1 on purpose; introduce per hot endpoint with explicit invalidation (never global cache).
4. **Module split** — only when a module earns its own deploy cycle/team; until then the modular monolith with DAG wins (see ADR 0003).

## 3. Future triggers (not now)

- RLS: a client demands isolation beyond `WHERE tenant_id`.
- OTel/Prometheus: operations demand SLOs (today: logs + `/healthz` + `/readyz`).
- Queue beyond Taskiq/Redis: volume justifying another broker.
- Sharding/multi-region: well after read replicas.
