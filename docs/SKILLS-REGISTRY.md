# SKILLS-REGISTRY — fast-backend

> Fonte da verdade das skills. **Nada instala sem registro aqui.**
> Regras: pin por SHA/tag (nunca `latest`); `allowed-tools` restrito; ler `SKILL.md` + scripts antes de aprovar; instalação em `.opencode/skills/` (repo) com entrada nesta tabela.

## Instaladas

| Nome | Origem (URL + SHA/tag) | Escopo permitido | Motivo (por que neste projeto) | Status | Risco + mitigação | Dono |
|---|---|---|---|---|---|---|
| `openspec-*` (8 workflow skills: propose/new/apply/verify/archive/continue/explore/sync) | `openspec init` (Fission-AI/OpenSpec) · `.opencode/skills/openspec-*/SKILL.md` | Orquestrar `openspec/changes/*` (proposal/tasks/design/verify) | Padronizar spec-before-plan | **instalada e em uso** (ver Uso abaixo) | Baixo — só markdown de workflow, sem acesso a segredos | planner, backend-implementer |
| `documentation-and-adrs` | `github.com/addyosmani/agent-skills` @`6ca0cd7` (2026-09-11) · `.opencode/skills/documentation-and-adrs/SKILL.md` | README/API/ADR/CHANGELOG a partir do código; convenção `docs/adr/000N-*` existente tem precedência | Alimentar docs OSS (README, ARCHITECTURE, SCALING, ADRs) | **instalada** | Baixo — markdown puro, MIT, sem scripts/rede; escaneada sem achados | docs-writer, planner |
| `git-workflow-and-versioning` | `github.com/addyosmani/agent-skills` @`6ca0cd7` (2026-09-11) · `.opencode/skills/git-workflow-and-versioning/SKILL.md` | Commits atômicos, tags, semver, changelog curado por impacto | Releases: tags como fonte da verdade + CHANGELOG humano | **instalada** | Baixo — markdown puro, MIT; escaneada sem achados | docs-writer |
| `shipping-and-launch` | `github.com/addyosmani/agent-skills` @`6ca0cd7` (2026-09-11) · `.opencode/skills/shipping-and-launch/SKILL.md` | Checklists pré-lançamento, rollout, rollback, monitoramento | Release automation + runbook de rollback | **instalada** | Baixo — markdown puro, MIT; escaneada sem achados | planner, backend-implementer |
| `ci-cd-and-automation` | `github.com/addyosmani/agent-skills` @`6ca0cd7` (2026-09-11) · `.opencode/skills/ci-cd-and-automation/SKILL.md` | Gates, pipelines, preview, flags, rollback | Automatizar release workflow (tag → Release) | **instalada** | Baixo — markdown puro, MIT; escaneada sem achados | backend-implementer |
| `docs-generate` | `github.com/laurigates/claude-plugins` @`943cf0b` (2026-09-11) · `.opencode/skills/docs-generate/SKILL.md` | Gerar `--api/--readme/--changelog` a partir do código | Alimentar README/CHANGELOG a partir do código real | **instalada** | Baixo-médio — repo menor; markdown puro sem scripts; escaneada sem achados; cita subagente inexistente aqui (usar como runbook) | docs-writer |
| `cmd-makefile` | `github.com/olshansk/agent-skills` @`dd50876` (2026-09-11) · `.opencode/skills/cmd-makefile/SKILL.md` | Makefiles python-uv/fastapi/postgres (só a SKILL.md; templates adaptados manualmente) | Base p/ Makefile + skill `makefile-keeper` | **instalada** | Baixo-médio — markdown puro sem scripts; grep limpo; `skillci audit`: só FPs heurísticos em trechos defensivos sobre `.env` (nunca commitar/sobrescrever) | backend-implementer, docs-writer |
| `writing-makefiles` | `github.com/redhat-community-ai-tools/claude-plugins` @`b91c530` (2026-09-11) · `.opencode/skills/writing-makefiles/SKILL.md` | Padrão `help` autodocumentado, pitfalls, teste de Makefiles | Base p/ Makefile + skill `makefile-keeper` | **instalada** | Baixo — org reputável; markdown puro; grep limpo; `skillci audit` sem achados críticos | backend-implementer, docs-writer |
| `makefile-keeper` | Autoria local (2026-09-11) · `.opencode/skills/makefile-keeper/SKILL.md` | Manter o `Makefile` do repo no padrão (help-first, guards, docs sync) | Dono do Makefile + `docs/Makefile.md` | **instalada** | Baixo — markdown puro, sem scripts/rede | backend-implementer, docs-writer |

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

## Triagem client-visualization (2026-09-15)

Pesquisa via `npx skills find` para a SPA `/client` (Vite + React + shadcn + Tailwind v4 + tweakcn). Nenhuma instalada ainda — abaixo só triagem; instalação exige SHA/tag + auditoria do `SKILL.md` + entrada em Instaladas.

| Nome | Origem (skills.sh) | Uso pretendido | Status | Risco + mitigação | Dono |
|---|---|---|---|---|---|
| `vercel-labs/agent-skills@vercel-react-best-practices` | `skills.sh/vercel-labs/agent-skills/vercel-react-best-practices` (~713k installs, oficial) | Runbook principal de padrões React/TS em `/client` | avaliada, candidata a aprovada | Baixo — origem oficial; mesmo assim ler `SKILL.md`, pin por SHA/tag, instalar em `.opencode/skills/` do repo | planner |
| `igorwarzocha/opencode-workflows@vite-shadcn-tailwind4` | `skills.sh/igorwarzocha/opencode-workflows/vite-shadcn-tailwind4` (~117 installs) | Referência de scaffold Vite+shadcn+Tailwind4 | avaliada, só referência (não instalar sem auditoria) | Médio-baixo — poucos installs; usar como leitura, não instalar scripts sem auditoria | planner |
| `fusengine/agents@react-shadcn` | `skills.sh/fusengine/agents/react-shadcn` (~58 installs) | Alternativa shadcn | descartada | Médio — poucos installs e sobreposição com as acima | planner |

Nota: tweakcn sem skill relevante — tema via CSS-first do Tailwind v4 (`@theme` oklch).

## Triagem admin-control-plane + recovery + social (2026-09-15, changes A/B/C)

Nenhuma instalada — só triagem; instalação exige SHA/tag + auditoria do `SKILL.md` + entrada em Instaladas. SQLAdmin/CRUDAdmin são referência de proteções (rate-limit, CSRF, IP, audit), nunca autoridade (`/admin → ORM → UPDATE` ignoraria policies; ADR 0005).

| Nome | Origem | Uso pretendido | Status | Risco + mitigação | Dono |
|---|---|---|---|---|---|
| `sqladmin-reference` (SQLAdmin, FastAPI/SQLAlchemy) | `github.com/aminalaee/sqladmin` (avaliação conceitual, sem instalar) | UX administrativa madura como referência p/ dashboard futuro | avaliada, só referência | Baixo-médio — não instalar como dependência do control plane; usar ideias | planner |
| `crudadmin-reference` (Benav Labs crudadmin) | `github.com/benavlabs/crudadmin` (avaliação conceitual, sem instalar) | Proteções de admin (sessões, CSRF, rate-limit, audit, IP) como checklist | avaliada, só referência | Médio — ecossistema próprio mas acoplaria arquitetura; usar como checklist OWASP | planner |
| `transactional-email-deliverability` | a definir (SPF/DKIM/DMARC p/ prod) | Entregabilidade SMTP prod (recovery) | avaliada, não instalada | Baixo — só docs quando prod exigir | docs-writer |
| `oauth-oidc-best-practices` | a definir (provedor OIDC na ativação) | Ativação futura Google/GitHub (state+PKCE, JWKS) | avaliada, não instalada | Médio — só na change de ativação, com segredos | planner |

## Como aprovar/instalar (quando autorizado)

1. `docs-writer` preenche SHA/data nesta tabela e muda `avaliada → aprovada`.
2. Instalar em `.opencode/skills/<nome>/` (não global), sem scripts pós-install sem auditoria.
3. `git status --short` + revisão. `aprovada → instalada`.
