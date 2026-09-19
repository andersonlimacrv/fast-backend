## 1. Medir verdade (2026-09-17, sem adivinhar)

- [x] 1.1 `pytest --collect-only -m unit` → 90; `-m integration` → 89 (total 179)
- [x] 1.2 `vitest run --reporter=json` → 102 passed, 0 failed
- [x] 1.3 `playwright test --list` → 14 em 3 arquivos
- [x] 1.4 `openspec/specs` → 37 dirs; `docs/adr/*.md` → 13

## 2. Carimbos (EN+PT onde houver espelho)

- [x] 2.1 `README.md` + `.pt-BR`: badges tiers (90/89/102/14), tabela Fact, tagline H1 (179), comentário de medição com data+comandos + árvore openspec (37)
- [x] 2.2 `AGENTS.md:10` (179 + 102 + 14, 37 capabilities, 13 ADRs, medido 2026-09-17)
- [x] 2.3 `ROADMAP.md:4` + Fase 12 (179 + 102 + 14, Fase 12 merge #12 + WIP) + Futuro item 3 ✅
- [x] 2.4 Extras: `docs/Makefile.md` + pt-BR (13 contratos, verificado), `.opencode/agents/tester.md` baseline, Fase 12 "Fases 0–12"

## 3. Estruturais

- [x] 3.1 `review-design.md` §12 errata (válidos vs superados, datada 2026-09-17)
- [x] 3.2 `ARCHITECTURE.md` + `.pt-BR`: seção client (dobra de CLIENT-STRUCTURE) + drift (13 contratos, `admin`, ADRs 0005–0013)
- [x] 3.3 `RULES.md` §10: norma anti-drift (carimbo em número vivo)

## 4. Gates

- [x] 4.1 Grep do aceite 1 → zero fora de CHANGELOG-histórico/comentários-mudança/history-arquivado (verificados um a um: README árvore corrigida; resto é registro datado)
- [x] 4.2 `git status --short` só docs; sem segredos; links/âncoras conferidos
