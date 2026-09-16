## Context

`scripts/auto_release.py` (funções puras testadas) + `auto-release.yml` (PR merged → bump+tag+push) + `release.yml` (tag → Release). Falhas reais pós-merge: identidade git, token-loop, encoding. Ruído: fixes de CI cunhando patch.

## Goals / Non-Goals

**Goals:** falhar barato na PR; silenciar releases vazios; manter determinismo testável sem rede.
**Non-Goals:** labels de semver; gates locais obrigatórios.

## Decisions

1. **Check como workflow separado (não job do `ci.yml`)** — falha com mensagem própria e clara; `ci.yml` continua sendo gates de código. Rejeitado: pré-commit hook (burlável, SO-dependente).
2. **`--check` puro no script** (lista de arquivos → exit 0/1 + motivo) + lista `EXEMPT` explícita e curta; `CHANGELOG.md` no diff sempre satisfaz (mesmo sem `[Unreleased]` novo — a entrada pode ter vindo de commit anterior da mesma PR... na prática: exige seção `[Unreleased]` não-vazia no diff OU arquivo tocado? Decisão: exige hunk adicionando linha não-vazia sob `[Unreleased]`; docs-only passa sempre).
3. **Silêncio via `--if-needed`** no mesmo script (reusa o parse): sem corpos Unreleased E sem `CHANGELOG.md` no merge (`git diff HEAD~1 --name-only`) → exit 0 sem tocar nada. Workflow chama sempre com a flag.
4. **ADR 0012, não emenda à 0011** — ADRs nunca editadas; refinamento vira registro novo.

## Risks / Trade-offs

- [PR que só mexe em workflow/docs mas muda comportamento (ex.: CI) → regra simples pode pedir changelog à toa; aceito (custo de 1 linha) e a lista EXEMPT é ajustável] → documentado.
- [Merge fast-forward sem merge-commit → `HEAD~1` ainda é o main anterior; squash-PR sempre tem 2 pais] → `git diff HEAD~1` válido nos dois casos.

## Migration Plan

Sem migração. Rollback = revert dos commits + deletar workflow.

## Open Questions

- Nenhuma bloqueante.
