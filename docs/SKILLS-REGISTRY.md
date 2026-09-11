# SKILLS-REGISTRY — fast-backend

> Fonte da verdade das skills. **Nada instala sem registro aqui.**
> Regras: pin por SHA/tag (nunca `latest`); `allowed-tools` restrito; ler `SKILL.md` + scripts antes de aprovar; instalação em `.opencode/skills/` (repo) com entrada nesta tabela.

| Nome | Origem (URL + SHA/tag) | Escopo permitido | Motivo (por que neste projeto) | Status | Risco + mitigação | Dono |
|---|---|---|---|---|---|---|
| `openspec-*` (8 workflow skills: propose/new/apply/verify/archive/continue/explore/sync) | `openspec init` (Fission-AI/OpenSpec) · `.opencode/skills/openspec-*/SKILL.md` | Orquestrar `openspec/changes/*` (proposal/tasks/design/verify) | Padronizar spec-before-plan | **instalada** (via init) | Baixo — só markdown de workflow, sem acesso a segredos | planner, backend-implementer |
| `fastapi` (oficial) | `https://github.com/fastapi/fastapi/blob/master/fastapi/.agents/skills/fastapi/SKILL.md` · pinar SHA na instalação | Só leitura de padrões FastAPI/Pydantic (`Annotated`, lifespan, routers); sem Bash | Oficial tiangolo; alinha async + Pydantic v2 free-first | pendente | Baixo — oficial. Adaptar: prefere SQLModel, nós usamos SQLAlchemy 2.0 | planner, backend-implementer |
| `pytest-fastapi-async` | `https://github.com/ai-enhanced-engineer/aiee-skills/blob/main/skills/pytest-fastapi-async/SKILL.md` · pinar SHA | Padrões `asyncio_mode=auto`, `httpx ASGITransport`, fixtures app/DB/fakeredis | Exato p/ TDD async + Postgres + Redis | pendente | Baixo-médio — terceiro pequeno; auditar markdown | tester |
| `test-driven-development` | `https://github.com/obra/superpowers` · install via `.opencode/INSTALL.md` · pinar commit | Metodologia RED-GREEN-REFACTOR, YAGNI; usar só `tdd/writing-plans/debugging` | Disciplina anti-overengineering | pendente | Médio — grande/opinativo; não sobrescrever nossos 6 agentes | planner, tester |
| `tdd` leve (alt.) | `https://github.com/spaceteams/opencode-skills/blob/main/skills/tdd/SKILL.md` · pinar SHA | Iron Law: sem código prod sem teste falhando | Alternativa enxuta ao superpowers | pendente | Baixo — focado | tester |
| `python-pro` | `https://github.com/Jeffallan/claude-skills/blob/main/skills/python-pro/SKILL.md` · pinar SHA | Python 3.11+ type-safe, `mypy --strict`, pytest fixtures, ruff | Cobre `ruff 128` + mypy num lugar | pendente | Baixo-médio — MIT; auditar | backend-implementer |
| `security-reviewer` | `https://github.com/ervet/opencode-skills/blob/main/.opencode/skills/security-reviewer/SKILL.md` (mirror `fichtip/opencode-skills`) · pinar SHA | SAST: `bandit -r`, `semgrep --config=auto`, `gitleaks`, `pip-audit/trivy`, OWASP/CVSS | Cobre checklist v2 §13 + boundaries §20 | pendente | Médio — pede Bash; restringir a scanners, nunca `curl\|sh` | security-auditor |
| `docker-development` | `https://github.com/alirezarezvani/claude-skills/blob/main/engineering/docker-development/skills/docker-development/SKILL.md` · pinar SHA | Multi-stage, compose healthcheck/networks/volumes | Postgres+Redis self-hosted VPS | pendente | Baixo-médio — genérico; adaptar p/ Python | backend-implementer |
| `stripe-best-practices` | `https://docs.stripe.com/skills` + `https://github.com/stripe/ai/blob/main/skills/stripe-best-practices/SKILL.md` | Billing/webhooks/tax (Fase 7) | Único confiável p/ Stripe | **bloqueada até Fase 7** | Baixo (oficial) mas envolve secret — só na monetização | backend-implementer |

## Como aprovar/instalar (quando autorizado)

1. `docs-writer` preenche SHA/data nesta tabela e muda `pendente → aprovada`.
2. Instalar em `.opencode/skills/<nome>/` (não global), sem scripts pós-install sem auditoria.
3. `git status --short` + revisão. `aprovada → instalada`.
