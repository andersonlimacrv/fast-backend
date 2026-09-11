## 1. Empacotamento

- [x] 1.1 `Dockerfile` (deps/dev/migrate/prod) + `.dockerignore` + build das stages ok
- [x] 1.2 `docker-compose.yml` + `docker-compose.prod.yml` + `app/worker.py`

## 2. Deploy + rollback

- [x] 2.1 `scripts/deploy.py` (tags, healthcheck-gate, rollback) + testes unitários da decisão
- [x] 2.2 `.github/workflows/deploy.yml` + `rollback.yml`

## 3. Template + docs

- [x] 3.1 `scripts/new_project.py` + teste de bootstrap
- [x] 3.2 `README.md` operacional + `docs/DEPLOYMENT.md` + `CHANGELOG.md` + mapa no `AGENTS.md`

## 4. Gate + verify

- [x] 4.1 Full gates + suite verdes; request `/opsx-verify`
