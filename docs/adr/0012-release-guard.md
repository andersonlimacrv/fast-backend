# ADR 0012 — Release guard: check em tempo de PR + silêncio pós-merge

- Status: aceito (implementado na change `release-guard`, 2026-09-16: `--check`/`--if-needed` + workflow + 4 testes)
- Data: 2026-09-16
- Refina: ADR 0011 (auto-release a cada PR merged)

## Contexto

O auto-release funcionou de primeira no fluxo feliz, mas provou 3 defeitos na prática: falha só aparece pós-merge (identidade git, loop do token, encoding Windows) e todo merge cunha release — até `fix(ci)` — gerando ruído de versão.

## Decisão

1. Workflow `release-check.yml` em PR (só leitura): dry-run do script + exige hunk adicionando linha não-vazia sob `[Unreleased]` quando a PR toca comportamento (`app/**`, `client/src/**`, `scripts/**`, manifests, `Dockerfile`, composes, `Makefile`, `.github/**`); docs-only (`*.md`, `docs/**`, licenças, gitignore, `openspec/**`) passa sempre.
2. Regra de silêncio (`--if-needed`): merge sem corpos Unreleased e sem `CHANGELOG.md` no diff → loga `nothing to release`, exit 0, sem tag.
3. Falha barato na PR, automação total pós-merge; pré-commit segue só documentado (burlável, SO-dependente).

## Consequências

- Positivas: defeito de release aparece antes do merge; fixes de CI/docs passam em silêncio.
- Negativas: PR que muda comportamento de workflow/docs técnica precisa de 1 linha de changelog (custo aceito; lista EXEMPT ajustável).
- Reversão: deletar `release-check.yml` + flag, nova ADR (nunca editar esta).
