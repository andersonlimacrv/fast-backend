## Why

A prosa do repo hardcodifica contagens vivas e divergiu da verdade medida: `AGENTS.md:10` e `docs/ROADMAP.md:4` diziam 36 capabilities (disco tem 37); README exibe badges `85/65/71/10` e tagline "150 backend tests" (medido 2026-09-17: 90 unit + 89 integration = 179, vitest 102, Playwright 14); README/AGENTS dizem 12 ADRs (disco tem 13); `ARCHITECTURE.md` parou no tempo (12 contratos vs 13 no Makefile, sem módulo `admin`, ADRs só até 0004, zero client); `review-design.md` não registra o que mudou desde 2026-09-16 (dropdown radix adotado contra a decisão do §2, collapsible trocado, S7–S13 da sidebar); e nada impede a próxima divergência. É o item 3 do Futuro registrado (`docs/ROADMAP.md`).

## What Changes

Docs-only, sem runtime, sem testes:

1. **Contagens com carimbo**: README (+pt-BR) badges/tabela/tagline, `AGENTS.md`, `ROADMAP.md` passam a exibir a verdade medida em 2026-09-17 (backend 179 = 90 unit + 89 integration; vitest 102; Playwright 14; 37 specs; 13 ADRs) com data e comando de medição junto ao número.
2. **Errata `review-design.md`**: seção §12 datada — o que continua válido vs o que foi superado (dropdown radix como exceção registrada ao §2, collapsible radix em S8.6, iterações S7–S13, scaffold playground, `custom-ui-restructure`).
3. **Dobrar `CLIENT-STRUCTURE` em `ARCHITECTURE.md`** (+pt-BR): seção client concisa (regra pasta=rota, grupos de layout, `custom-ui` vs `ui`, autoridade nunca na URL) com link para o doc canônico; aproveita para corrigir drift (13 contratos, módulo `admin`, índice ADR 0005–0013).
4. **Anti-drift em `RULES.md`**: norma nova — número vivo em prosa exige carimbo (data + comando ou link para o CHANGELOG); sem carimbo, remover o número e apontar a fonte.

## Capabilities

### New Capabilities

- Nenhuma (higiene de docs).

### Modified Capabilities

- `guides-docs`: regra anti-drift + carimbos.

## Impact

- Alterados: `README.md` (+pt-BR), `AGENTS.md`, `docs/ROADMAP.md`, `docs/review-design.md`, `docs/ARCHITECTURE.md` (+pt-BR), `docs/RULES.md`.
- `CHANGELOG.md` histórico intacto (seções versionadas nunca reescritas); entrada `[Unreleased]` docs-only não requerida (gate passa em silêncio), mas adicionada por rastreabilidade? Não — docs-only passa sem entrada (ADR 0012); sem entrada.

## Non-goals

Mudar números de teste/código, reescrever `review-design.md` §§1–11, traduzir docs internas (PT-BR por `RULES.md §9`).

## Acceptance criteria

1. `grep` por `150 backend|85_tests|65_tests|71_tests|10_tests|36 capabilities|12 ADRs` em `README*/AGENTS/ROADMAP/ARCHITECTURE*` → zero (só histórico do CHANGELOG e comentários de medição).
2. Toda contagem viva restante tem carimbo `medido em YYYY-MM-DD` + comando ou link.
3. `ARCHITECTURE.md` cita `CLIENT-STRUCTURE.md` e o mapa de módulos inclui `admin`; índice ADR vai a 0013; EN/PT espelhados.
4. `review-design.md` §12 existe com válidos vs superados; `RULES.md` tem a norma anti-drift.
