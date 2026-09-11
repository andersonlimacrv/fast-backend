# SKILLS-REGISTRY — fast-backend

> Fonte da verdade das skills. **Nada instala sem registro aqui.**
> Regras: pin por SHA/tag (nunca `latest`); `allowed-tools` restrito; ler `SKILL.md` + scripts antes de aprovar; instalação em `.opencode/skills/` (repo) com entrada nesta tabela.

## Instaladas

| Nome | Origem (URL + SHA/tag) | Escopo permitido | Motivo (por que neste projeto) | Status | Risco + mitigação | Dono |
|---|---|---|---|---|---|---|
| `openspec-*` (8 workflow skills: propose/new/apply/verify/archive/continue/explore/sync) | `openspec init` (Fission-AI/OpenSpec) · `.opencode/skills/openspec-*/SKILL.md` | Orquestrar `openspec/changes/*` (proposal/tasks/design/verify) | Padronizar spec-before-plan | **instalada e em uso** (ver Uso abaixo) | Baixo — só markdown de workflow, sem acesso a segredos | planner, backend-implementer |

## Uso registrado (por que "não se vê" skill sendo usada)

Nota de arquitetura: este ambiente **não expõe Skill como ferramenta invocável** — skills aqui funcionam como runbooks: o agente lê o `SKILL.md` e executa os Steps manualmente. Foi exatamente o que aconteceu nas 8 fases:

| Fase | Skill (runbook) | Evidência |
|---|---|---|
| Todas (8 proposes) | `openspec-propose` | `openspec new change` + loop `status → instructions` até `applyRequires` pronto; 8 changes criadas |
| Todas (8 verifies) | `openspec-verify-change` | report 3 dimensões (Completude/Correção/Coerência) antes de cada archive |
| Todas (8 archives) | `openspec-archive-change` | `openspec archive <nome> -y` + specs sincronizadas (20 capabilities em `openspec/specs/`) |
| 0 | `openspec-new-change`, `openspec-explore`, `openspec-continue-change`, `openspec-sync-specs`, `openspec-apply-change` | instaladas via init; fluxos equivalentes executados manualmente (nenhuma change exigiu continue/sync separado) |

## Avaliadas, não instaladas (triagem 2026-09-11)

Nenhuma foi necessária: o projeto foi concluído com os runbooks acima + gates locais (`ruff/mypy/lint-imports/bandit/pip-audit/gitleaks`). Instalar agora seria risco sem propósito. Reavaliar se nova fase exigir.

| Nome | Origem | Motivo original | Veredito |
|---|---|---|---|
| `fastapi` (oficial) | `github.com/fastapi/fastapi/.../SKILL.md` | Padrões FastAPI/Pydantic | Não instalada — padrões já internalizados em `AGENTS.md`/`RULES.md`; adaptar SQLModel→SQLAlchemy seria o único ganho, insuficiente |
| `pytest-fastapi-async` | `aiee-skills/.../pytest-fastapi-async` | TDD async + fixtures | Não instalada — suite de 95 testes já segue o padrão (`asyncio_mode=auto`, ASGITransport, testcontainers) |
| `test-driven-development` / `tdd` leve | `obra/superpowers` / `spaceteams/opencode-skills` | Disciplina RED-GREEN | Não instalada — disciplina coberta pelo fluxo OpenSpec + testes-guia por fase |
| `python-pro` | `Jeffallan/claude-skills` | ruff+mypy estrito | Não instalada — toolchain equivalente já configurada em `pyproject.toml` |
| `security-reviewer` | `ervet/opencode-skills` | SAST/OWASP | Não instalada — SAST equivalente roda (`bandit/pip-audit/gitleaks` + `security-auditor`) |
| `docker-development` | `alirezarezvani/claude-skills` | Multi-stage/compose | Não instalada — Dockerfile + composes já entregues e validados com build real |
| `stripe-best-practices` | `docs.stripe.com/skills` | Billing/webhooks | Não instalada — Fase 7 implementada com SDK + HMAC próprio e 5 testes; reavaliar se billing evoluir (checkout/portal) |

## Como aprovar/instalar (quando autorizado)

1. `docs-writer` preenche SHA/data nesta tabela e muda `avaliada → aprovada`.
2. Instalar em `.opencode/skills/<nome>/` (não global), sem scripts pós-install sem auditoria.
3. `git status --short` + revisão. `aprovada → instalada`.
