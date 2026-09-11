# How to add a module (5 steps)

> 🇬🇧 English | [Português (BR)](add-module.pt-BR.md)
>
> Mirrored on `projects/` (showcase) and enforced by `lint-imports`. For theory, see `docs/ARCHITECTURE.md` and ADR 0003.

1. **Create `app/modules/<name>/`** with `models.py`, `schemas.py`, `service.py` (no `HTTPException`), `router.py`, `dependencies.py` (if needed), `public.py` (only what other modules may import), and `tests/`.
2. **Depend only on what's allowed**: `modules/*/public.py`, `core/contracts/`, Taskiq events. Register the `<mod>-internals-private` contract in `pyproject.toml` and list the module in the others' sources.
3. **Create the migration** (`alembic revision --autogenerate -m "<name>"`, review the SQL) + register models in `migrations/env.py`.
4. **Wire in `app/main.py`** (services on `app.state`, `include_router`) + `.env.example` for any new knob.
5. **Tests**: service unit + integration with real Postgres (never mocks for isolation) + prove the gate (`lint-imports` green).

Removal is the inverse: unwire, remove env/adapters/migration/tests/docs — no hidden dependency left (the gate reports it).
