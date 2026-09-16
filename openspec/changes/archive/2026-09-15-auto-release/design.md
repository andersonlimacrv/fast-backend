## Context

`release.yml` (on tag `v*.*.*` → notes via `release_notes.py` → `gh release create`); `release_notes.py` exige seção `## [v]`; tags como verdade (`git-workflow-and-versioning`); só existe a tag `0.1.0` (sem prefixo); convenção: arquivos sem `v`, tag com `v`.

## Goals / Non-Goals

**Goals:** zero `[Unreleased]` parado; cadeia PR→bump→tag→Release determinística e testada sem rede.
**Non-Goals:** bots externos, semver por label, alterar `release.yml`.

## Decisions

1. **Lógica em `scripts/auto_release.py`, workflow só orquestra** (convenção: lógica >5 linhas → scripts; permite unit test sem git/rede).
2. **Trigger `pull_request.closed` + `merged==true`** — push do bot não abre PR, logo não há loop; CI valida o commit de release normalmente.
3. **Base = max(tag `v*`, tag `X.Y.Z`)** — cobre o legado `0.1.0`; bump patch default, minor/major só via dispatch manual.
4. **Consolida todas as `[Unreleased]`** em vez de falhar — o estado atual tem 2; a partir daqui o formato canônico é 1 stub vazio.
5. **Fallback título-da-PR** quando vazio — release nunca trava por falta de texto; curadoria continua humana nas PRs.

## Risks / Trade-offs

- [Dois pushes (commit + tag) → tag sem commit? push atômico na mesma step (`git push --follow-tags`)] → um comando só.
- [Conflito se `main` andar entre merge e push → `git pull --rebase` antes do push; falha visível se der conflito] → sem force.
- [GITHUB_TOKEN em fork → workflow só roda em PR da própria repo (condição `github.event.pull_request.head.repo.full_name == github.repository`)] → sem vazamento de permissão.

## Migration Plan

Sem migração. Rollback = deletar tag/release + revert do commit de bump.

## Open Questions

- Nenhuma bloqueante.
