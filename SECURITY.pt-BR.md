# Security Policy — fast-backend

> 🇧🇷 Português (BR) | [English](SECURITY.md)

## Versões suportadas

Pré-1.0: apenas a `main` atual recebe correções. Use sempre a última tag.

| Versão | Suporte |
|---|---|
| `main` / última tag | ✅ |
| tags antigas | ❌ |

## Reportando vulnerabilidades

**Não abra issue pública.** Reporte em privado:

- Email: mantenha o canal do repositório (ou Security Advisories do GitHub, quando habilitado).

Inclua: descrição, passos p/ reproduzir, impacto, versão afetada e sugestão de correção, se houver.

## Escopo

Superfície de auth (hashing, JWT, refresh/rotation, lockout), isolamento de tenant, RBAC/entitlements, webhooks (HMAC), segredos em logs/git, dependências (`pip-audit`), containers (non-root, sem portas de dados expostas).

## Garantias anti-enumeração

- `POST /auth/login`: email desconhecido e senha errada retornam o **mesmo status 401 e corpo**; emails desconhecidos ainda gastam custo Argon2 igual (dummy verify descartado, ADR 0009).
- `POST /auth/password/forgot`: sempre `202 accepted`; linha + email só p/ usuário ativo existente; throttling por (ip, email).
- `POST /auth/password/reset`: reuse/expirado/desconhecido retornam o mesmo 400 genérico.
- Tradeoff aceito: `POST /auth/register` retorna 409 p/ email em uso (registro precisa dizer; mitigado por throttling).
- Provado por `test_auth_flows.py` (indistinguibilidade + verify gasto) e `test_leak_audit.py` (sem segredo em audit/outbox/logs). Inventário completo em `docs/PRIVACY.pt-BR.md`.

## Expectativas

- Confirmação em até 48h; atualização de status em até 1 semana.
- Correção por severidade; disclosure coordenado após o fix.
