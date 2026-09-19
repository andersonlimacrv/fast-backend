## 1. Ativos (`client/`)

- [x] 1.1 `client/index.html:5` favicon → `/fast-backend-logo_NO_BG.webp` (`type=image/webp`)
- [x] 1.2 Deletar `client/public/favicon.svg`, `client/public/icons.svg`, `client/public/fast-backend-logo_NO_BG.png`
- [x] 1.3 `grep -r "favicon.svg|icons.svg|NO_BG.png" client README.md README.pt-BR.md` → zero matches

## 2. Header + badges (`README.md` + espelho PT-BR)

- [x] 2.1 `# fast-backend` → banner centrado `docs/assets/fast-backend.webp` (`width=640`, `alt` com título)
- [x] 2.2 Cada grupo de badges em `<p align="center">` numa linha (status, backend, frontend, tiers)
- [x] 2.3 Tabela 4-col → vertical `Fact|Value` (Release, Backend, Frontend, Specs, Decisions); bullets de docs mantidos

## 3. Gates

- [x] 3.1 Badges 200 (URLs inalteradas); links da tabela 200
- [x] 3.2 `vite build` (ou `make web-build`) verde; favicon 200 no dev server
- [x] 3.3 `.pt-BR.md` espelha EN; `git status` só escopo; sem segredos; sem commit sem pedido
