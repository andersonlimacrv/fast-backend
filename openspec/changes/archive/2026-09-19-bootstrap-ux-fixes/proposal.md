## Why

Dois problemas provados na prática em 2026-09-19, no caminho feliz do primeiro usuário:

1. `make admin-bootstrap` **não funciona como documentado**: a receita não exporta nada — `BOOTSTRAP_KEY` vive só no `.env` (lido pelo pydantic dentro do `Settings`), mas `parse_args` lê `--key` do `os.environ`. Prova: shell fresco → `args.key == ""` enquanto `Settings().bootstrap_key` tem 64 chars → `compare_digest` falha → `bootstrap failed` genérico. O usuário digitou a senha à toa; o banco ficou com 0 linhas.
2. Sem confirmação de senha: one-shot + `getpass` sem eco — um typo na senha queima a única chance (o hash errado fica gravado e ninguém vê).

## What Changes

- `scripts/bootstrap_root.py` (`amain`): segundo prompt `confirm root password`; divergência ou curta (<8) → `GENERIC_FAILURE`, exit 1, 0 linhas. Genérico preservado.
- `Makefile` (`admin-bootstrap`): exporta `BOOTSTRAP_KEY` do `$(ENV_FILE)` para o script + exige `ROOT_EMAIL` (ou `make admin-bootstrap email=...`) com mensagem de uso; sem ele, falha explicando em vez de `bootstrap failed`.
- `CHANGELOG.md`: entrada `[Unreleased]` (Makefile é path de comportamento no `release-check`).
- Docs (`DEPLOYMENT.md` +pt-BR, READMEs): comandos atualizados para a nova forma (sem export manual).

## Capabilities

### New Capabilities

- Nenhuma (UX do CLI).

### Modified Capabilities

- `admin`: bootstrap com confirmação de senha e chave automática do `.env`.

## Impact

- Alterados: `scripts/bootstrap_root.py`, `Makefile`, testes CLI (unit sem DB + integração 0-linhas), `CHANGELOG.md`, docs da change 1 (linhas de comando).
- `parse_args --key`/`BOOTSTRAP_KEY` exportado seguem funcionando (precedência inalterada); quem exportava a chave não percebe diferença.

## Non-goals

Mudar mensagens fail-closed, validar email (change `bootstrap-email-validation`), prompt de email interativo, tocar serviço/HTTP.

## Acceptance criteria

1. Shell fresco, só `.env` com `BOOTSTRAP_KEY`: `ROOT_EMAIL=... make admin-bootstrap` cria o root (antes: `bootstrap failed`).
2. Senhas divergentes → exit 1 + 0 users + 0 audits, saída idêntica ao genérico.
3. `make admin-bootstrap` sem email → mensagem de uso (não genérico).
4. `pytest` unit + integração do bootstrap, `ruff`, `mypy`, `bandit -ll` verdes.
