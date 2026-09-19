## Context

Futuro item 3 (`docs/ROADMAP.md:91`): carimbos, errata `review-design`, dobra `CLIENT-STRUCTURE`, anti-drift. Verdade medida 2026-09-17: pytest collect 90 unit + 89 integration; vitest JSON 102/102; `playwright --list` 14/3 arquivos; 37 specs; 13 ADRs. Drift encontrado: badges README `85/65/71/10`, tagline "150 backend", "36 capabilities" (AGENTS/ROADMAP), "12 ADRs" (README/AGENTS), Fase 12 "155+102+16", ARCHITECTURE com 12 contratos/sem admin/ADRs até 0004/sem client.

## Goals / Non-Goals

Goals: número vivo sempre com carimbo; errata datada sem reescrever história; ARCHITECTURE dobra (não duplica) CLIENT-STRUCTURE; norma que impede reincidência. Non-goals: tocar código/testes, reescrever CHANGELOG histórico, traduzir docs internas.

## Decisions

1. **Carimbo = `medido em YYYY-MM-DD` + comando ou link** — colocado junto ao número (comentário HTML nos badges, linha na tabela, nota no AGENTS/ROADMAP). Rejeitado: remover todos os números (badges/tabela perdem valor de vitrine).
2. **Unit = 90 coletados com nota do fail pré-existente** — `test_bootstrap_tree` falha só neste worktree (`.git` é arquivo); carimbo registra "89 verdes + 1 falha ambiental pré-existente" em vez de esconder. Rejeitado: exibir 89 como total (mente a coleta).
3. **Errata como §12 apêndice, §§1–11 intactos** — debate original é histórico; errata lista válido vs superado com data e ponte para a change que superou. Rejeitado: reescrever o doc (apaga contexto das decisões).
4. **Dobra = seção concisa + link canônico** — ARCHITECTURE resume regra/grupos/autoridade em ~15 linhas e aponta `CLIENT-STRUCTURE.md` como fonte; espelho pt-BR idêntico (`RULES.md §9`). Rejeitado: mover o conteúdo (quebra links existentes) ou duplicar integral (drift duplo).
5. **Anti-drift como norma, não sugestão** — em `RULES.md`, com exemplo e exceção (CHANGELOG histórico e comentários de medição podem citar números antigos datados).

## Risks / Trade-offs

- [Números voltam a envelhecer no próximo merge] → norma exige carimbo; próximo `docs-release-audit` atualiza (fora desta change).
- [Espelhos pt-BR divergem] → aceite confere EN/PT lado a lado.
