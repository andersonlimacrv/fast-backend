# AGENTS.md — Instruções para agentes de IA (Opencode / Claude)

> Leia este arquivo + `docs/RULES.md` antes de qualquer tarefa.

## 1. Contexto

- Repo: `fast-backend` — Modular Monolith Async FastAPI SaaS Kernel (v2 congelada).
- Referência congelada (somente leitura, **nunca editar**): `references/implementation_v2.md`.
- Evidência upstream (somente leitura): `/home/anderson/dev/copy/benavlabs_FastAPI-boilerplate@0.19.0`, `/home/anderson/dev/copy/benavlabs_crudauth@0.6.0`.
- Estado: **v1.0.0 entregue** (tag `0.1.0`) — `app/` implementado (Fases 1–8), Fases 9–11 concluídas (admin/recovery, landing/login/LGPD, dev-loop/env-check/reformulação client), 138 testes backend + 71 vitest e 10 Playwright em `client/`, 36 capabilities. Decisões congeladas: Auth própria (sem crudauth), Argon2id (pwdlib), JWT HS256 10-15min, refresh opaco Postgres com rotation+reuse+atomicidade, `tokens_valid_after`, `TENANCY_MODE=single|row` sem RLS no v1, `active_org_id` contexto (autoridade = membership Postgres), idempotência lógica.
- Nomenclatura congelada: `CORE_MODULES` (nunca `PLATFORM_MODULES`); opcionais por flag (ex.: `BILLING_ENABLED`).
- Stack: FastAPI async + SQLAlchemy 2.0 + Pydantic v2 + Postgres + Redis + Alembic + Taskiq + Docker + `uv`.

## 2. Hierarquia (topo vence)

`AGENTS.md > docs/RULES.md > docs/ROADMAP.md > docs/adr/* > references/* > copy/*`

## 3. Regra de ouro (fluxo normal)

**Nova fase/tarefa relevante exige OpenSpec change (`openspec/changes/<nome>/proposal.md|tasks.md|design.md`) + aprovação antes de implementar.**

- Nunca commitar segredos (`.env` é gitignored; só `.env.example`). `references/` é imutável: conflito com a v2 → registrar ADR, nunca reescrever a referência.
- Mudanças estruturais (novo módulo, contrato, migração) exigem change correspondente.

## 4. Como trabalhar

1. **Idioma:** respostas em PT-BR; código e identificadores em inglês. Docs voltadas ao usuário em inglês + variante `.pt-BR.md`; docs internas/processo (AGENTS, RULES, ROADMAP, ADRs, openspec) em PT-BR.
2. **Plano antes de código + spec antes de plano:** `planner` escreve `openspec/changes/<nome>/proposal.md|tasks.md`, só então `backend-implementer` executa.
3. **Evidência:** ler locais antes de afirmar; citar `path:linha`; upstream só via `copy/`.
4. **Verificação:** `git status --short` após cada mudança. Sem commit sem pedido. Conventional Commits. Sem segredos.
5. **Estilo:** `ruff` line-length 128, type hints, async-first, `asyncio_mode=auto`, `import-linter` p/ DAG.
6. **Delegação a subagentes:** classificar pela tabela §5 → chamar via `Task` (`subagent_type` + prompt autossuficiente com paths, aceite, formato do retorno e comando de verificação; contexto zera a cada chamada) → paralelizar o independente na mesma mensagem → não duplicar o trabalho delegado → verificar o retorno com gates reais → resumir ao usuário (saída do subagente não é visível a ele). Change aprovada antes de delegar implementação; tester com Postgres real também quando delegado; retorno é rascunho até passar nos gates.

## Design system

Antes de gerar ou alterar qualquer componente de UI, leia `docs/DESIGN.md` por completo e siga os tokens, componentes base e padrões de interação definidos lá. Não reintroduza cores, espaçamentos ou variantes de componente fora do documentado — proponha uma alteração ao DESIGN.md primeiro (`ui-designer` desenha, `frontend-implementer` executa, `design-auditor` confere).

## 5. Subagentes (`.opencode/agents/`)

| Agente | Arquivo | Via | Quando usar |
|---|---|---|---|
| `planner` | `planner.md` | `Task` | Análise read-only. Lê v2 + `copy/` antes de opinar. |
| `backend-implementer` | `backend-implementer.md` | `Task` | Implementa pós-change. Conhece auth/tenancy/DAG. **Exige change aprovada.** |
| `code-reviewer` | `code-reviewer.md` | `Task` | 3 eixos: Standards + Spec + Security. Read-only. |
| `security-auditor` | `security-auditor.md` | `Task` | Auditoria SAST + auth/tenancy. Read-only. **Novo.** |
| `tester` | `tester.md` | `Task` | TDD; exige Postgres real p/ auth/tenancy; mock não prova isolamento. |
| `docs-writer` | `docs-writer.md` | `Task` | Dono de README/docs/registry/ADRs. |
| `ui-designer` | `ui-designer.md` | runbook (sem tipo `Task`) | Propõe tokens/componentes a partir de `docs/DESIGN.md`. Read-only, nunca implementa. |
| `frontend-implementer` | `frontend-implementer.md` | runbook (sem tipo `Task`) | Implementa UI pós-change no `client/`. Conhece camadas e gates `npm`. **Exige change aprovada.** |
| `design-auditor` | `design-auditor.md` | runbook (sem tipo `Task`) | Audita UI vs `DESIGN.md` (tokens, a11y, anti-clichês) + `make web-e2e`. Read-only. |

Primários: `build` (executa), `plan` (Tab, analisa sem alterar).

## 6. Mapa

```text
fast-backend/
├── README.md / AGENTS.md / CHANGELOG.md / opencode.json
├── Dockerfile / .dockerignore / docker-compose.yml / docker-compose.prod.yml
├── .opencode/agents/ (9 agentes: 6 núcleo + ui-designer/frontend-implementer/design-auditor)
├── scripts/ backup.py, deploy.py, new_project.py
├── docs/ RULES.md, ROADMAP.md, DEPLOYMENT.md, BOILERPLATE-ANALYSIS.md, SKILLS-REGISTRY.md, adr/0001-0004
├── openspec/ (specs + changes)
├── references/implementation_v2.md (congelada, nunca editar)
└── .github/ (ci, deploy, rollback)
```

Mapa atual (v1.0.0): `app/{core,infrastructure,modules}/`, `app/tests/{unit,integration,e2e,fixtures}/`, `app/migrations/` (pacote `app`, imports `from app.*` — ADR 0004) + `pyproject.toml`, `alembic.ini`, `.env.example` na raiz.

## 7. Referências

- `docs/RULES.md` — regras normativas.
- `docs/ROADMAP.md` — fases 0-8.
- `docs/BOILERPLATE-ANALYSIS.md` — reusar vs descartar vs greenfield.
- `docs/SKILLS-REGISTRY.md` — skills (nada instala sem registro).
- `docs/adr/` — decisões (0001 auth, 0002 tenancy, 0003 tiers, 0004 app-dir).
