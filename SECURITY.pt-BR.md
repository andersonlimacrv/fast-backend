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

## Expectativas

- Confirmação em até 48h; atualização de status em até 1 semana.
- Correção por severidade; disclosure coordenado após o fix.
