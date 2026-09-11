# ADR 0004 — Diretório da aplicação: `app/` flat (pacote B1)

- Status: aceito
- Data: 2026-09-11
- Decisão do usuário: Opção B, variante B1.
- Referência congelada: `references/implementation_v2.md` §2.1 (árvore `backend/src/...`, mantida como está — nunca editar a referência)

## Decisão

A aplicação vive em `app/` flat, que é o próprio pacote Python:

```text
pyproject.toml / alembic.ini / .env.example / Dockerfile   # raiz = projeto Python
app/                          # o próprio pacote
├── core/                     # contracts/, errors.py, security/hashing.py, settings.py, module_registry.py
├── infrastructure/           # auth/, db/, cache/, storage/, email/, observability/
├── modules/                  # identity/, organization/, tenancy/, entitlements/, billing_stripe/, audit/, notifications_email/
├── migrations/
└── tests/                    # unit/, integration/, e2e/, fixtures/, conftest.py
```

- Imports sempre `from app.*` (ex.: `from app.core.errors import ...`, `from app.modules.identity.public import ...`).
- Tooling: `ruff known-first-party=["app"]`, `pytest pythonpath` apontando a raiz (ou pacote instalado), sem `where=["src"]` no packaging.
- Mapa canônico p/ leitura cruzada com a v2: **`backend/src/X` (v2) ≡ `app/X` (nosso)**.

## Alternativa rejeitada

`src-layout` (`app/src/...`, como na v2 e no Fastro): um nível a mais sem benefício aqui — só faria sentido com múltiplos pacotes distribuíveis no mesmo dir, o que não é o caso do v1. Divergência consciente e documentada; a v2 permanece como referência de "como/porquê", não de paths literais.
