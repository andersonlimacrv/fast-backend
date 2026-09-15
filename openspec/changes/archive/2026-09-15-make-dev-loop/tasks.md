## 1. Makefile

- [x] 1.1 `_check-web-env` (guard `client/.env`, mensagem acionável) + `dev` (`db-up → migrate → up → hint CORS → web`) + `dev-down` + `.PHONY`
- [x] 1.2 `docs/Makefile.md` + `.pt-BR.md` (seções Docker/Run)

## 2. Gates

- [x] 2.1 `make help` lista ambos; `make help-unclassified` vazio
- [x] 2.2 Guard: sem `client/.env`, `make dev` falha rápido nomeando o arquivo
- [x] 2.3 E2E: stack + Vite no ar (`/healthz` + :5173), `make dev-down` limpo
- [x] 2.4 `openspec verify` antes de `archive`
