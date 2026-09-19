# Makefile — documentação completa dos scripts

> 🇧🇷 Português (BR) | [English](Makefile.md)
>
> `make help` é o índice. Este doc é o manual: o que cada target faz,
> por que existe, como funciona e como preencher parâmetros. Padrão
> cobrado pela skill `makefile-keeper`.

## Variáveis (pontos de fork — sobrescreva, não edite)

| Variável | Default | O que faz | Exemplo |
|---|---|---|---|
| `UV` | `uv` | Runner de pacotes Python | `make sync UV=uvx` (raramente necessário) |
| `COMPOSE` | `docker compose` | Orquestração de containers | `make up COMPOSE="podman compose"` |
| `ENV_FILE` | `.env` | Arquivo consumido pelo `_check-env` | `make up ENV_FILE=.env.staging` |
| `HOST` / `PORT` | `127.0.0.1` / `8000` | Bind do `api` | `make api PORT=9000` |
| `WORKERS` | `2` | Concorrência do `worker` Taskiq | `make worker WORKERS=4` |
| `STACK_SERVICES` | `db redis` | Serviços que o `db-reset` recria | `make db-reset STACK_SERVICES="db redis minio"` |
| `BUILD_TARGET` | `prod` | Stage do Dockerfile p/ `build` | `make build BUILD_TARGET=dev` |
| `IMAGE` / `TAG` | `fast-backend` / `dev` | Nome da imagem do `build` (nunca `:latest`) | `make build IMAGE=ghcr.io/org/app TAG=abc1234` |
| `BACKUP_DIR` | `./var/backups` | Destino do `backup` | `make backup BACKUP_DIR=/mnt/backups` |
| `POSTGRES_IMAGE` / `REDIS_IMAGE` | `postgres:17-alpine` / `valkey/valkey:9-alpine` | Imagens pinadas dos serviços de dados (fonte única; RULES §10) | `make db-up POSTGRES_IMAGE=postgres:18-alpine` |
| `DOCKER` | `docker` | CLI do daemon usado pelos fixtures de teste | `make test-integration DOCKER=podman` (fixtures leem `DOCKER_BIN`) |
| `NPM` / `CLIENT_DIR` / `WEB_PORT` | `npm` / `client` / `5173` | Knobs do servidor dev do frontend | `make web WEB_PORT=3000` |
| `CONFIRM` | *(vazio)* | Confirmação p/ destrutivos | `make db-reset CONFIRM=1` |
| `msg` / `f` / `rev` | *(vazio)* | Args obrigatórios: mensagem de migration, arquivo de teste, revisão de downgrade | `make migration msg="..."` |
| `FILE` | *(vazio)* | Artefato do restore | `make restore FILE=... CONFIRM=1` |
| `name` / `dest` | *(vazio)* | Nome e destino do `new-project` | `make new-project name=x dest=../x` |
| `v` | *(vazio)* | Versão do `release-notes` | `make release-notes v=v1.1.0` |

Segredos e URLs (`DATABASE_URL`, `BACKUP_PASSPHRASE`, …) vêm sempre do
ambiente, nunca de variáveis do Makefile ou arquivos.

## Setup — primeira vez

- **`make setup`** — *O quê:* bootstrap completo de um clone zerado. *Por quê:*
  um comando do zero ao funcionando (env + deps + schema). *Como:* roda
  `env-template` → `sync` → `migrate` em ordem. Sem parâmetros.
- **`make sync`** — *O quê:* instala deps travadas (`uv sync --extra dev`).
  *Por quê:* `pyproject.toml` + `uv.lock` são a única fonte da verdade (nunca
  `pip install`). Sem parâmetros.
- **`make env-template`** — *O quê:* copia `.env.example` → `.env`.
  *Por quê:* `.env` tem segredos reais e é gitignored; o template versiona o
  schema. *Como preencher:* nada — mas **nunca sobrescreve** um `.env`
  existente (seguro repetir).
- **`make env-check`** — *O quê:* tabela de drift `.env` vs `.env.example`
  (KEY | DEFAULT do código | .ENV | APLICADO fonte | STATUS) + sanidade de
  valores espelhando os validators de `Settings`. *Por quê:* env parado falha
  obscuro em runtime; aqui falha cedo e legível. Segredos sempre mascarados
  (só tamanho), URLs redactadas, exit `0` limpo / `1` drift-ou-inválido /
  `2` arquivo ausente. Nunca escreve. Roda dentro do `setup`.

## Database — schema e inspeção

- **`make migrate`** — *O quê:* aplica migrations pendentes (`alembic upgrade
  head`). *Por quê:* schema evolui por migration, nunca na mão.
- **`make migration msg="..."`** — *O quê:* cria migration `autogenerate`.
  *Por quê:* captura o diff dos models. *Parâmetro* `msg` (obrigatório):
  mensagem curta no imperativo. *Depois:* revise o SQL gerado, rode `make migrate`.
- **`make downgrade [rev=]`** — *O quê:* reverte uma revision (`rev=base`
  reverte tudo). *Por quê:* desfazer migration ruim localmente. *Parâmetro*
  `rev` (opcional, default `-1`).
- **`make db-current` / `make db-history`** — *O quê:* versão aplicada /
  histórico completo. *Por quê:* "em qual schema estou?" antes de debugar.
- **`make db-shell`** — *O quê:* abre `psql` no `DATABASE_URL`. *Por quê:*
  inspeção/debug. *Como:* remove o marcador de dialeto async (`+asyncpg`)
  que o `psql` não entende. Precisa `DATABASE_URL` exportado.
- **`make db-reset CONFIRM=1`** — *O quê:* destrói volumes locais, recria
  `$(STACK_SERVICES)`, migra. *Por quê:* banco dev do zero.
  *(⚠️ DESTRUTIVO — exige `CONFIRM=1`, recusa sem ele.)*

## Tests — níveis

- **`make test`** — suite completa (precisa Docker: bridge, ou
  `FB_TEST_NETWORK=host` onde bridge é bloqueada — ver `make test-host`).
- **`make test-unit`** — rápidos, sem serviços (`-m unit`).
- **`make test-integration`** — Postgres+Redis reais via testcontainers.
- **`make test-host`** — suite completa com `FB_TEST_NETWORK=host` para
  sandboxes sem rede veth.
- **`make test-file f=<path>`** — um arquivo. *Parâmetro* `f` (obrigatório):
  `make test-file f=app/tests/unit/test_jwt.py`.
- **`make e2e`** — fluxo HTTP equivalente ao da SPA contra a API no ar (precisa de `make api` + banco migrado; `E2E_BASE_URL`/`E2E_SPA_ORIGIN` sobrescrevem).
- **`make clean`** — remove caches (`__pycache__`, `.pytest_cache`,
  `.ruff_cache`, `.mypy_cache`). Seguro: nunca toca fonte.

## Verify — gates (espelho do CI)

- **`make lint`** — `ruff check` + `format --check` em `app scripts`.
- **`make format-fix`** — auto-fix + format (muta a árvore; nunca no CI).
- **`make types`** — `mypy app scripts`.
- **`make arch`** — `lint-imports`: 13 contratos (layers, DAG, fronteiras; verificado 2026-09-17).
- **`make security`** — `bandit -r app scripts -q -ll` (gate 0 Medium+) +
  `pip-audit` + `gitleaks`.
- **`make verify`** — todos os gates estáticos (`lint` + `types` + `arch`).
- **`make check`** — gate local de PR (`verify` + `test-unit`). Rode antes do push.

## Docker — stack local

- **`make up`** — app + worker + db + redis (precisa `.env`; `_check-env`
  falha rápido mandando rodar `make env-template`).
- **`make db-up`** — só db + redis (serviços de dados p/ dev local: migrate/api/test contra eles).
- **`make dev`** — loop dev completo: `_check-env` + `_check-web-env` (`client/.env` com `VITE_API_URL`) → `db-up` → `migrate` → `up` (stack detached) → dica de CORS se `$(WEB_PORT)` fora do `.env` → `web` em foreground. API em `:8000/docs`, SPA em `:5173`. Ctrl+C para só o Vite; **`make dev-down`** para a stack (mantém volumes).
- **`make down`** — para tudo, mantém volumes. **`make restart`** — `down` + `up`.
- **`make logs` / `logs-app` / `logs-db`** — acompanha logs (todos / app / postgres).
- **`make tools`** — profiles mailpit + minio (captura de email dev, teste S3).
- **`make build [IMAGE=… TAG=…]`** — imagem prod (default `fast-backend:dev`).
  Nunca tagear `:latest` (rollback precisa de `:sha` imutável).

## Run — processos dev

- **`make api [PORT=]`** — uvicorn com reload + factory do app
  (`http://127.0.0.1:8000/docs`).
- **`make worker [WORKERS=]`** — `taskiq worker app.worker:broker`.
- **`make web-install`** — `npm ci` dentro de `$(CLIENT_DIR)` (shell-agnostic, funciona até no cmd do Windows).
- **`make web [WEB_PORT=]`** — servidor dev Vite (`http://localhost:5173`). Precisa de `client/.env` (`VITE_API_URL`) e CORS do backend liberando a origem.
- **`make web-lint` / `web-test` / `web-build`** — `oxlint`, `vitest run`, `tsc -b && vite build` dentro de `$(CLIENT_DIR)`.
- **`make web-e2e-install`** — Chromium do Playwright (versão segue o pin de `client/package.json`).
- **`make web-e2e`** — E2E de browser (axe + snapshots, Chromium) contra `vite preview` — rode `web-build` antes; suítes logadas precisam da API no ar, senão pulam e a cobertura anônima roda. Baselines por plataforma: `linux/` commitado (seed só via `web-e2e-baselines.yml`), `win32/` local gitignored. **Legado: roda contra a API de DEV e polui o banco dev — prefira `make e2e-full`.**
- **`make e2e-db-up` / `e2e-db-down` / `e2e-clean`** — postgres+redis isolados p/ e2e (`E2E_PG_PORT`/`E2E_REDIS_PORT`, volumes próprios; `clean` remove containers, volumes ficam).
- **`make e2e-migrate` / `e2e-api` / `e2e-build` / `e2e-stop`** — migra o banco e2e, API de fundo (`E2E_API_PORT`, CORS p/ `E2E_WEB_PORT`), build do preview apontado p/ ela, teardown.
- **`make e2e-full`** — E2E de browser isolado de ponta a ponta (DB/API/preview próprios, teardown no fim; banco dev intocado).

## Ops — backups, scaffolding, releases

- **`make backup`** — backup criptografado para `$(BACKUP_DIR)`. Precisa
  `BACKUP_PASSPHRASE` e `DATABASE_URL` no ambiente (falha nomeando o que falta).
- **`make restore FILE=<artefato> CONFIRM=1`** — restaura um artefato.
  *Parâmetros:* `FILE` (obrigatório), `CONFIRM=1` (obrigatório).
  *(⚠️ DESTRUTIVO — sobrescreve o banco.)*
- **`make new-project name=<kebab> dest=<dir>`** — scaffolda projeto irmão
  (copia a árvore menos VCS/venvs/caches, renomeia). Ambos obrigatórios.
- **`make release-notes v=<vX.Y.Z>`** — imprime a seção do CHANGELOG da versão
  (alimenta `gh release create`). Falha sem seção correspondente — é o gate
  funcionando, não bug.

## Meta

- **`make change name=<kebab>`** — scaffolda `openspec/changes/<nome>/`
  (proposal antes de código, por `AGENTS.md`).
- **`make help`** — este índice (goal default). **`make help-unclassified`** —
  auditoria: targets com `##` mas sem seção `##@`; deve imprimir nada.

## Targets destrutivos (lista completa)

`db-reset`, `restore`. Ambos recusam sem `CONFIRM=1` e carregam
`(⚠️ DESTRUCTIVE)` no `make help`. O CI nunca os invoca.

## Personalizando (sem quebrar o padrão)

1. Prefira overrides (`make api PORT=9000`) a edições.
2. Target novo: kebab-case, `##` de uma linha (o que afeta + exemplo inline),
   seção `##@` acima, entrada `.PHONY`.
3. Seção nova: header emoji `##@`; num Makefile único não há `include`s p/ ordenar.
4. Knob de env novo: default `?=` + documente nesta tabela + `.env.example`.

## Relação com o CI

O CI (`.github/workflows/ci.yml`) chama os **mesmos** targets (`lint`, `types`,
`arch`, `test-unit`, `test-integration`, `security`) — nunca comandos duplicados.
Divergência p/ qualquer lado é bug: corrija o Makefile ou o workflow.
