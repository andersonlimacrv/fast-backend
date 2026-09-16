## 1. Medir verdade (sem adivinhar)

- [ ] 1.1 `uv run pytest --collect-only -q -m unit` → N unit (anotar)
- [ ] 1.2 `uv run pytest --collect-only -q -m integration` → N integration (anotar)
- [ ] 1.3 `cd client && npm run test -- --reporter=json` (ou `vitest run`) → N vitest
- [ ] 1.4 `npx playwright test --list` em `client/` → N e2e (ou contar `*.spec.ts`)
- [ ] 1.5 Decidir números finais (medido vence; se indisponível, manter + comentar data)

## 2. Badges (README.md:5-26 + espelho PT-BR)

- [ ] 2.1 L10 Tests → `https://github.com/andersonlimacrv/fast-backend/actions/workflows/ci.yml/badge.svg`
- [ ] 2.2 L23-26 tiers → formato `backend_unit-<N>_tests-0AAAB8?style=flat-square&labelColor=222` (4 linhas)
- [ ] 2.3 `curl -I` / HEAD nas 5 URLs (200); screenshot preview sem corte

## 3. Tagline (README.md:28 + PT-BR:28)

- [ ] 3.1 EN mix dor+autoridade+ganho+prova (2 linhas máx.)
- [ ] 3.2 PT-BR espelho fiel (não tradução literal pobre)

## 4. How-to-run só README

- [ ] 4.1 Reescrever Getting started/Começando: journey `0 prereqs → 1 make setup → 2 make dev → 3 make check/test` (+ troubleshooting 3 linhas: Git Bash no Win, bridge bloqueada → `make test-host`, CORS/`client/.env`)
- [ ] 4.2 Nova subseção `Generate future code from here` / `Gerar código futuro a partir daqui`: `make new-project` → `make change` → `make migration` + `docs/guides/add-module.md` → `make check` (links reais)
- [ ] 4.3 Índice (Contents/Índice) com âncoras

## 5. CHANGELOG

- [ ] 5.1 Header explica `[Unreleased]` vazio = normal (bot `--if-needed`, ADR 0011)
- [ ] 5.2 Template comentado sob `## [Unreleased]`
- [ ] 5.3 `uv run python scripts/release_notes.py --version v0.1.1` passa

## 6. Gates finais

- [ ] 6.1 `.pt-BR.md` espelha EN (badges/tagline/journey/fork)
- [ ] 6.2 `git status --short` + `git diff --stat` revisados; sem segredos; sem commit (sem pedido)

## 7. Status block (adendo aprovado 2026-09-16)

- [ ] 7.1 Trocar blockquote defasado (v1.0.0/tag 0.1.0/36 specs) por tabela Release|Tests|Specs|Docs + bullets de disposição docs (EN+PT)
- [ ] 7.2 Verdade medida: tag `v0.1.1`, 150 backend (85+65) + 71 vitest + 10 e2e, 37 specs em disco, 12 ADRs, Fases 0–11, ADR 0011+0012
