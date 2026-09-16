## Context

Convenção do repo: usuário em EN + `.pt-BR.md`; interno em PT-BR (RULES §9); tags como verdade (`git-workflow-and-versioning`); `release_notes.py` exige seção `## [v]` no CHANGELOG.

## Goals / Non-Goals

**Goals:** toda afirmação de versão/fase/contagem com fonte única e igual em todo lugar.
**Non-Goals:** reescrever passado; mover arquivos sem decisão.

## Decisions

1. **CHANGELOG fica na raiz** (recomendação, p/ aprovação): convenção Keep-a-Changelog + GitHub renders + `release_notes.py` + `release.yml` apontam para `./CHANGELOG.md`; mover quebraria tooling por zero ganho. Alternativa (`docs/CHANGELOG.md` + symlink?) rejeitada: symlink quebra no Windows.
2. **ROADMAP é espelho, CHANGELOG é jornal**: ROADMAP resume fases; detalhe vive no CHANGELOG + specs. Divergência de contagem resolve-se atualizando, nunca apagando.
3. **Checagem de links por script efêmero** (não commitado): varre `.md` por `](...)` relativos e confere existência; relatório vai para a change, não para o repo.

## Risks / Trade-offs

- [Auditoria encontra lacuna grande de tradução → vira follow-up listado, não escopo desta change] → evita explosão.

## Migration Plan

Sem migração. Rollback = reverter commit de docs.

## Open Questions

- CHANGELOG em `/docs`? (decisão acima, p/ aprovação do operador)
