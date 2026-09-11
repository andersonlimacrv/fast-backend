## Context

Pós-v1.0.0: produto pronto, vitrine não. Referência de processo: skills instaladas (`documentation-and-adrs` p/ estrutura/ADRs, `docs-generate --readme/--changelog` p/ extração do código, `git-workflow-and-versioning` p/ tag+changelog como contrato, `shipping-and-launch` p/ checklist de release, `ci-cd-and-automation` p/ workflow).

## Goals / Non-Goals

**Goals:**
- Visitante entende, roda e contribui em <10 min de leitura.
- Release = tag + entrada no CHANGELOG, sem passo manual além disso.
- Guias derivados do código (não inventados): DAG, knobs, passos de módulo.

**Non-Goals:**
- Site de docs, i18n, branding, bots de release.

## Decisions

1. **Badges shields.io estáticos + 2 dinâmicos via GitHub** (`actions/workflows/ci.yml/badge.svg`, `github/v/release`) — sem serviço terceiro com token.
2. **`gh release create` com notes extraídas do CHANGELOG por script Python** (`scripts/release_notes.py`, testável) em vez de `release-drafter` — determinístico, sem bot, sem config extra; falha se a tag não tem seção (força o hábito "changelog com a change").
3. **Tag formato `vMAJOR.MINOR.PATCH`** (com `v`); CHANGELOG mantém `0.1.0` histórico + novas entradas `vX.Y.Z`? Não — normalizar: a partir daqui, tags e seções usam `v` prefixado; seção `0.1.0` existente ganha alias visível (nota de transição, sem reescrever histórico).
4. **`.github/README.md` removido, não atualizado** — diretório autoexplicativo com 3 workflows; placeholder com falsidades ("nenhum workflow") é pior que ausência.
5. **Guias com verificação mecânica onde der**: ARCHITECTURE cita os 12 contratos (contáveis via `lint-imports`), SCALING cita defaults lidos do `settings.py` (não chutados), add-module checklist espelha `tasks.md` de change real.
6. **CONTRIBUTING/S SECURITY/templates curtos e aplicáveis** — espelham `AGENTS.md`/`RULES.md` (não duplicam: linkam).

## Risks / Trade-offs

- [Badge de testes com contagem estática envelhece] → badge genérico "tests passing" via CI, sem número no README (número vive no CHANGELOG/CI).
- [Release workflow nunca executado de verdade aqui] → aceitar com dry-run documentado + teste unitário do extrator de notes; primeira release real valida.
- [Alternativa rejeitada: release-drafter/release-please] → mais automação, porém bot + permissões + config; time pequeno se beneficia mais de determinismo simples.
