## Context

Precedent: `2026-09-15-readme-badges-refresh` used label-only tiers to avoid aging numbers; user now explicitly wants static counts fixed + measured (drift accepted, mitigated by `measured` comment + next docs-audit sync). shields.io static badges: `https://img.shields.io/badge/<label>-<message>-<color>?style=flat-square&labelColor=222`. Previous teal `0AC` (3-digit) renders inconsistently; 6-digit `0AAAB8` is the canonical teal. Tests badge `.../github/actions/workflow/status/...` is deprecated; canonical is `github.com/<org>/<repo>/actions/workflows/<wf>/badge.svg`.

## Goals / Non-Goals

**Goals:** badges que renderizam em todo parser, números auditáveis, tagline que vende sem hype, README executável zero→fork.
**Non-Goals:** automação de badges, nova doc, mudança de release-bot.

## Decisions

1. **Tiers estáticas fixas** (decisão do usuário): `backend_unit-85_tests` style com `_` (evita `--` que alguns parsers quebram), cor `0AAAB8`, `labelColor=222` consistente com stack `222`.
2. **Tests badge canônica**: `https://github.com/andersonlimacrv/fast-backend/actions/workflows/ci.yml/badge.svg` (mesmo padrão do CI badge L6, prova dinâmica real).
3. **Tagline mix dor+autoridade+ganho**: pressuposição ("Stop rebuilding…/Pare de reconstruir…") + mecanismo específico (Argon2id, JWT rotation, row-tenancy) + prova (N testes verdes, admin/audit/backup inclusos) + ganho/urgência (days, not months). Sem mencionar "PNL" no README.
4. **How-to-run só no README**: journey numerada + `### Generate future code from here` / `### Gerar código futuro a partir daqui`; manual segue em `docs/Makefile.md` (sem duplicar tabela de variáveis).
5. **CHANGELOG**: header explica `[Unreleased]` vazio = normal (bot `--if-needed`); template comentado para copiar/colar. Sem mudar convenção `v`-prefix.

## Risks / Trade-offs

- [Estático desatualiza → comentário `measured` + sync no próximo docs-audit] — aceito pelo usuário.
- [Playwright não conserta markdown → uso só visual (screenshot de preview)] — sem inflar escopo.
- [Números medidos podem exigir Docker para integration → fallback: collect-only (não executa) funciona sem serviços].

## Migration Plan

Docs only. Rollback = revert commit. Nenhuma migração, nenhum contrato.

## Open Questions

- Nenhuma bloqueante (4 decisões do usuário registradas no plano aprovado).
