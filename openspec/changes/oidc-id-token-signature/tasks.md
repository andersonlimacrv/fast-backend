# oidc-id-token-signature — tasks

## S0 — Change + ADR

- [x] 0.1 `openspec/changes/oidc-id-token-signature/{proposal,design,tasks}.md`
- [x] 0.2 `docs/adr/0015-oidc-id-token-signature.md`; pointer in ADR 0014

## S1 — Dependência

- [x] 1.1 `cryptography` em `pyproject.toml` + `uv lock`/`uv sync`
- [x] 1.2 `pip-audit` limpo com a nova dep

## S2 — Adapter

- [x] 2.1 `oidc.py`: `jwks_uri` obrigatório, cache de chaves, refetch no
      `kid` desconhecido, `RS256`-only, `iss`/`aud`/`exp`+leeway/`nonce`
- [x] 2.2 Docstring atualizada (fim do "future hardening")

## S3 — Testes

- [x] 3.1 unit com chaves RSA reais: válido, adulterado, aud/iss/nonce
      errados, expirado, alg != RS256, rotação de `kid` (13 testes)
- [x] 3.2 integração social existente verde (fake sem `id_token`)

## S4 — Verificação

- [x] 4.1 `ruff` + `mypy` + `lint-imports`; unit (158) + integração social
- [x] 4.2 `CHANGELOG.md`; `git status`; sem commit sem pedido
