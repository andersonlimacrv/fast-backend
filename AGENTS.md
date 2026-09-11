# AGENTS.md — Instruções para agentes de IA (Opencode / Claude)

> Leia este arquivo + `docs/RULES.md` antes de qualquer tarefa.

## 1. Contexto

- Repo: `fast-backend` — Modular Monolith Async FastAPI SaaS Kernel (v2 congelada).
- Referência congelada (somente leitura, **nunca editar**): `references/implementation_v2.md`.
- Evidência upstream (somente leitura): `/home/anderson/dev/copy/benavlabs_FastAPI-boilerplate@0.19.0`, `/home/anderson/dev/copy/benavlabs_crudauth@0.6.0`.
- Estado: Fase 0 — sem `app/`. Decisões congeladas: Auth própria (sem crudauth), Argon2id (pwdlib), JWT HS256 10-15min, refresh opaco Postgres com rotation+reuse+atomicidade, `tokens_valid_after`, `TENANCY_MODE=single|row` sem RLS no v1, `active_org_id` contexto (autoridade = membership Postgres), idempotência lógica.
- Nomenclatura congelada: `CORE_MODULES` (nunca `PLATFORM_MODULES`), `OPTIONAL_MODULES` + `ENABLED_MODULES`.
- Stack: FastAPI async + SQLAlchemy 2.0 + Pydantic v2 + Postgres + Redis + Alembic + Taskiq + Docker + `uv`.

## 2. Hierarquia (topo vence)

`AGENTS.md > docs/RULES.md > docs/ROADMAP.md > docs/adr/* > references/* > copy/*`

## 3. Regra de ouro (bloqueio ativo)

**Sem `app/` sem OpenSpec change aprovada + ordem explícita do usuário.**

- Proibido sem liberação: criar `app/`, `src/`, `pyproject.toml` de app, `Dockerfile`, `docker-compose.yml`, `.env`, migrations; rodar `uv sync`, `pip install`, `docker compose up`, `alembic`, `pytest` de app.
- Permitido agora: `README.md`, `AGENTS.md`, `opencode.json`, `.opencode/agents/`, `docs/`, `openspec/`, `.github/`, `.gitignore`.
- `references/` é imutável. Conflito com a v2 → registrar ADR, nunca reescrever a referência.
- Dizer "clonar" ou "iniciar Fase N" exige confirmação de escopo + change correspondente.

## 4. Como trabalhar

1. **Idioma:** PT-BR; código e identificadores em inglês.
2. **Plano antes de código + spec antes de plano:** `planner` escreve `openspec/changes/<nome>/proposal.md|tasks.md`, só então `backend-implementer` executa.
3. **Evidência:** ler locais antes de afirmar; citar `path:linha`; upstream só via `copy/`.
4. **Verificação:** `git status --short` após cada mudança. Sem commit sem pedido. Conventional Commits. Sem segredos.
5. **Estilo:** `ruff` line-length 128, type hints, async-first, `asyncio_mode=auto`, `import-linter` p/ DAG.

## 5. Subagentes (`.opencode/agents/`)

| Agente | Arquivo | Quando usar |
|---|---|---|
| `planner` | `planner.md` | Análise read-only. Padrão Fase 0-1. Lê v2 + `copy/` antes de opinar. |
| `backend-implementer` | `backend-implementer.md` | Implementa pós-change. Conhece auth/tenancy/DAG. **Bloqueado sem change.** |
| `code-reviewer` | `code-reviewer.md` | 3 eixos: Standards + Spec + Security. Read-only. |
| `security-auditor` | `security-auditor.md` | Auditoria SAST + auth/tenancy. Read-only. **Novo.** |
| `tester` | `tester.md` | TDD; exige Postgres real p/ auth/tenancy; mock não prova isolamento. |
| `docs-writer` | `docs-writer.md` | Dono de README/docs/registry/ADRs. |

Primários: `build` (executa), `plan` (Tab, analisa sem alterar).

## 6. Mapa

```text
fast-backend/
├── README.md / AGENTS.md / opencode.json
├── .opencode/agents/ (6 agentes)
├── docs/ RULES.md, ROADMAP.md, BOILERPLATE-ANALYSIS.md, SKILLS-REGISTRY.md, adr/0001-0003
├── openspec/ (specs + changes)
├── references/implementation_v2.md (congelada, nunca editar)
└── .github/ (CI futuro)
```

Futuro (não criar agora): `app/{core,infrastructure,modules}/`, `app/tests/{unit,integration,e2e,fixtures}/`, `app/migrations/` (pacote `app`, imports `from app.*` — ADR 0004) + `pyproject.toml`, `alembic.ini`, `.env.example` na raiz.

## 7. Referências

- `docs/RULES.md` — regras normativas.
- `docs/ROADMAP.md` — fases 0-8.
- `docs/BOILERPLATE-ANALYSIS.md` — reusar vs descartar vs greenfield.
- `docs/SKILLS-REGISTRY.md` — skills (nada instala sem registro).
- `docs/adr/` — decisões (0001 auth, 0002 tenancy, 0003 tiers, 0004 app-dir).
