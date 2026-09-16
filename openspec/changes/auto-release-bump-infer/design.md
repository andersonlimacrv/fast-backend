## Context

`auto-release.yml` (merge em `main`) chama `auto_release.py --if-needed --pr-title … --bump patch`
(sempre patch em evento de PR). O título convencional da PR (`feat:`, `fix:`, `!`) já está
disponível como `PR_TITLE`, mas o script o usa só como texto de fallback. Resultado observado:
`feat(client): dashboard…` → `v0.1.2` (deveria ser minor por semver).

## Goals / Non-Goals

**Goals:** bump inferido do título (feat→minor, fix→patch, breaking→major), com override
manual preservado (`workflow_dispatch` com `bump` explícito) e default seguro (`patch`).
**Non-Goals:** reescrever histórico, mudar gate de entrada, inferir por labels/diff.

## Decisions

1. **Inferência mora no script, não no YAML** — função pura, unit-testável sem git
   (padrão do arquivo: "pure functions unit-tested", `main()` toca git). YAML muda só
   o default do input e repassa o valor.
2. **Novo valor `auto` em vez de mágica com string vazia** — explícito no `--help` e nas
   choices; `resolve_bump` centraliza a precedência (explícito > inferência > patch).
3. **Corpo (`pr_body`) suportado na função, não fiado no workflow** — o evento de merge
   tem `pull_request.body` disponível, mas o workflow atual não o repassa; `BREAKING CHANGE`
   no título já cobre o caso real. Adicionar `--pr-body` ao YAML fica como dívida futura
   (não mexe em mais linha de CI agora).
4. **Regex tolerante, default conservador** — `^\s*(\w+)(?:\([^)]*\))?(!)?:`, case-insensitive;
   tipo desconhecido/ausente → `patch`. Semver nunca sobe por acidente.
5. **Tipos patch conhecidos (fechado):** `fix, perf, refactor, docs, test, chore, ci, build,
   style, revert`. `feat` é o único minor. Qualquer outro tipo → patch (não minor),
   para não inflar versão com tipos custom futuros.

## Risks / Trade-offs

- [Título fora do padrão numa feature real → patch (subestimado). Mitigado: é o comportamento
  atual para tudo, logo nunca piora; `workflow_dispatch` com bump explícito corrige] — aceito.
- [YAML: input default `patch`→`auto` muda dispatch manual sem escolha (passa a inferir).
  Mitigado: operador ainda escolhe patch/minor/major explicitamente] — aceito.

## Migration Plan

Só `scripts/`, teste unitário e 2 linhas de workflow. Rollback = revert. Sem efeito retroativo:
próximo merge com título `feat:` corta `x.Y+1.0`.

## Open Questions

- Nenhuma bloqueante (mapeamento aprovado pelo dono em 2026-09-16).
