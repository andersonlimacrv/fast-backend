# ADR 0011 — Auto-release a cada PR merged

- Status: aceito (implementado na change `auto-release`, 2026-09-15: `scripts/auto_release.py` + workflow + 7 testes unit)
- Data: 2026-09-15
- Decisão do usuário: nada parado em `[Unreleased]`; toda PR vira release automaticamente

## Contexto

`[Unreleased]` acumulava (chegou a 2 seções) e release exigia tag manual. A cadeia `release.yml` (tag → notes → GitHub Release) já existia e funciona; faltava só o gatilho.

## Decisão

1. Workflow `auto-release.yml` em `pull_request.closed` com `merged == true` (+ `workflow_dispatch` p/ minor/major e dry-run): `scripts/auto_release.py` consolida `[Unreleased]` em `## [vX.Y.Z] — data`, sincroniza `pyproject.toml` + `app_version` + `.env.example`, commita, tagueia; push único com `--follow-tags`. O `release.yml` existente cria o Release — sem loop, porque push nunca abre PR.
2. Base = maior tag (`v*` ou legada `X.Y.Z`); bump patch default; fallback = título da PR quando Unreleased vazio.
3. Lógica pura testável sem git/rede; workflow só orquestra (convenção: lógica >5 linhas → `scripts/`).

## Alternativas rejeitadas

- Release-please/bots: dependência externa para o que 120 linhas nossas resolvem com os gates do repo.
- Versionamento por label de PR: cerimônia sem ganho neste estágio.
- `git push --force`: nunca; conflito aparece como falha visível.

## Consequências

- Positivas: `[Unreleased]` nunca acumula; cada merge tem tag+Release rastreáveis.
- Negativas: toda PR gera release (ruído em PRs de docs — aceito conscientemente); minor/major exigem dispatch manual.
- Reversão: deletar o workflow + nova ADR (nunca editar esta).
