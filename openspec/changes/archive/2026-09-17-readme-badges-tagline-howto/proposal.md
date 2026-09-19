## Why

README badges render inconsistently (deprecated `workflow/status` Tests badge, 3-digit `0AC` tier color, `--`-escaped labels) and tier counts (`85/65/71/10`) are hardcoded without a measured source. The tagline (`README.md:28`) is generic — no pain, no authority, no proof. Getting started exists but has no single zero-to-running-to-forking journey. `CHANGELOG.md:41` `[Unreleased]` empty looks broken to newcomers, though it is by design (ADR 0011, auto-release `--if-needed`).

## What Changes

- Fix badge URLs (canonical shields format, 6-digit teal, `labelColor=222`, working Tests badge) with counts re-measured via `pytest --collect-only` + `vitest` + Playwright list; static tiers kept per user decision.
- Rewrite tagline EN+PT with PNL mix (pain + authority + gain + proof), no explicit PNL jargon in output.
- Rewrite `Getting started` / `Começando` as numbered journey (prereqs → `make setup` → `make dev` → `make check/test`) + new `Gerar código futuro` subsection (fork via `make new-project`, `make change`, `make migration`, `docs/guides/add-module.md`).
- Clarify `CHANGELOG.md` header + commented `[Unreleased]` template. No version bump, no entry move.
- Mirror every edit EN ↔ PT-BR. Docs-only, no runtime.

## Capabilities

### New Capabilities

- Nenhuma.

### Modified Capabilities

- `oss-presence`: badges provados + tagline + quickstart/fork journey current.
- `guides-docs`: README como índice executável do how-to-run (manual segue em `docs/Makefile.md`).
- `release-automation`: `[Unreleased]` documentado como estado normal (sem mudança de comportamento do bot).

## Impact

- Só `README.md`, `README.pt-BR.md`, `CHANGELOG.md` + este change. Nenhum runtime, nenhuma URL nova além de shields.io já usadas. Rollback = revert commit.

## Non-goals

- Badges dinâmicas por tier; novas seções além de quickstart/fork; `docs/` nova (decisão do usuário: só README); tocar em `references/components_to_use/` ou `.lgpd/`; Playwright como fixer (só conferência visual).

## Acceptance criteria

1. 5 badge URLs retornam HTTP 200; screenshot/preview sem corte.
2. Contagens = saída medida (ou comentário `<!-- measured: YYYY-MM-DD -->` se medição indisponível).
3. Tagline EN+PT no tom mix aprovado.
4. README tem journey numerada + subseção fork/gerar-código com os 4 comandos linkados.
5. `release_notes.py --version v0.1.1` passa; release-check docs-only passa.
6. `.pt-BR.md` espelha EN.
