## Why

Docs cresceram por acréscimo (Fases 0–10 + reformulação): desalinhamentos prováveis entre `CHANGELOG.md`, `docs/ROADMAP.md`, tags git, `openspec/specs/`, ADRs, READMEs (raiz + client) e `.env.example`. Auditoria ponta a ponta com correções.

## What Changes

- Verificação (só leitura): CHANGELOG × tags × ROADMAP × specs × ADRs × READMEs × `.env.example` × Makefile/docs + links quebrados internos.
- Correções: sync de conteúdo (versões, contagens, fases, links); sem reescrita histórica.
- Decisão registrada: `CHANGELOG.md` fica na raiz ou move para `docs/` (ver design).

## Capabilities

### New Capabilities

- Nenhuma.

### Modified Capabilities

- `guides-docs`, `release-automation`, `oss-presence`: requisitos de sincronia documental verificados e cumpridos.

## Impact

- Só docs + change OpenSpec. Nenhum runtime, nenhum teste novo (a prova é a própria auditoria + gates de links).

## Non-goals (v2 §21)

Reescrever histórico do CHANGELOG; traduzir tudo que falta de uma vez (lista follow-ups); mudar versionamento.

## Acceptance criteria

1. Matriz de verificação (tabela) sem divergência aberta ou com follow-up registrado.
2. Links internos docs↔README↔specs íntegros (checagem automatizada simples).
3. `openspec verify` antes de `archive`.
