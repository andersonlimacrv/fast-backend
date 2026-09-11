# Como adicionar um módulo (5 passos)

> Espelhado em `projects/` (vitrine) e cobrado por `lint-imports`. Para a teoria, ver `docs/ARCHITECTURE.md` e ADR 0003.

1. **Criar `app/modules/<nome>/`** com `models.py`, `schemas.py`, `service.py` (sem `HTTPException`), `router.py`, `dependencies.py` (se precisar), `public.py` (só o que outros módulos podem importar) e `tests/`.
2. **Depender só do permitido**: `modules/*/public.py`, `core/contracts/`, eventos Taskiq. Registrar o contrato `<nome>-internals-private` em `pyproject.toml` e listar o módulo nas sources dos demais.
3. **Criar a migration** (`alembic revision --autogenerate -m "<nome>"`, revisar o SQL) + registrar modelos em `migrations/env.py`.
4. **Montar em `app/main.py`** (services no `app.state`, `include_router`) + `.env.example` se houver knob novo.
5. **Testes**: unit do service + integração com Postgres real (nunca mock p/ isolamento) + provar o gate (`lint-imports` verde).

Remover é o inverso: desmontar, remover env/adapters/migration/testes/docs — sem deixar dependência oculta (o gate acusa).
