# root-bootstrap-tests — design

## Costuras de teste (sem mudar comportamento)

- `bootstrap(settings, email, password, key)`: gate da chave acontece ANTES
  de qualquer I/O (`ValueError` puro) → unit sem DB com `Settings(...)`.
- Caminhos com DB (`create_superuser`, root-existente, email-tomado, audit)
  → integração com fixtures existentes (`containers`, `clean_db` que já faz
  `TRUNCATE ... users ... CASCADE`); settings via `model_copy(update=...)`
  sobre `base_settings` + `bootstrap_key` de teste.
- `amain(argv)`: email vazio/short-circuit antes do getpass → unit com
  `monkeypatch`; caminho feliz via integração (getpass mockado, `DATABASE_URL`
  e demais via `os.environ` — `Settings()` lê env, como o CLI real).
- `parse_args`: unit puro (flags + defaults de `ROOT_EMAIL`/`BOOTSTRAP_KEY`).

## Casos (espelham as 7 tentativas reais do dono)

| # | Caso | Tipo | Espera |
|---|---|---|---|
| 1 | chave errada | unit | `ValueError` (sem tocar DB) |
| 2 | chave/settings vazias | unit | `ValueError` |
| 3 | email vazio | unit | return 1, sem getpass |
| 4 | senha <8 | unit | return 1 |
| 5 | sucesso | integração | superuser+staff, audit `root.bootstrap` |
| 6 | segundo bootstrap | integração | recusa (fail-closed genérico) |
| 7 | email já registrado | integração | recusa |
| 8 | `amain` ponta a ponta | integração | exit 0 + `root created:` |

## Alternativas consideradas

- Mockar `AuthenticationService`: rejeitado — RULES proíbe mock onde Postgres
  real prova (isolamento/autoridade); unit cobre só o que é puro.
- E2E do bootstrap: rejeitado — CLI interativo (getpass) não pertence ao browser.
