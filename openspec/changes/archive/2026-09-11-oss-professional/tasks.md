## 1. Presença OSS

- [x] 1.1 `README.md` profissional (badges, TOC, quickstart, links) + remover `.github/README.md` obsoleto
- [x] 1.2 `CONTRIBUTING.md` + `SECURITY.md` + issue/PR templates linkados

## 2. Release automation

- [x] 2.1 `scripts/release_notes.py` + testes + `.github/workflows/release.yml` (tag `v*` → Release; falha sem seção)
- [x] 2.2 CHANGELOG: nota de transição `0.1.0` → prefixo `v` daqui em diante

## 3. Guias a partir do código

- [x] 3.1 `docs/ARCHITECTURE.md` (mapa, DAG, fluxos, ADRs)
- [x] 3.2 `docs/SCALING.md` (knobs reais, ordem vertical-first, gatilhos futuros)
- [x] 3.3 `docs/guides/add-module.md` (5 passos executáveis)

## 4. Gate + verify

- [x] 4.1 Full gates + suite verdes; request `/opsx-verify`
