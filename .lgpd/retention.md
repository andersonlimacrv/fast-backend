# Retenção e Eliminação — fast-backend

**Versão**: v1 — diagnóstico + regras propostas (2026-09-16)
**Skill**: `lgpd-retention-erasure`

> Hierarquia: retenção legal > contratual > vontade do titular (Art. 18, VI).
> Nada aqui é aconselhamento jurídico; prazos propostos exigem validação do Encarregado/jurídico.

## Regras por tabela

| Tabela | Regra proposta | Gatilho | Ação pós-prazo | Status |
|---|---|---|---|---|
| `password_resets` | eliminar ao expirar/usar | `expires_at`/`used_at` | hard delete via `password.purge` (Taskiq) | ✅ implementado e testado |
| `refresh_tokens` (revogadas) | 90 dias após `revoked_at` | idade da revogação | hard delete (job a criar) | 🟡 proposto (change futura) |
| `audit_log` | `AUDIT_RETENTION_DAYS` (propor 730 dias, configurável) | `created_at` | hard delete em lote auditado (job a criar) | 🟡 proposto (change futura + validação jurídica) |
| `users` (+ cascata) | eliminação total só via DSAR deferido | pedido Art. 18, VI sem retenção legal oposta | hard delete com cascade + prova (endpoint a criar, L7) | 🔴 inexistente (só `disable` hoje) |
| `memberships/organizations/projects` | segue o usuário (cascade) ou anonimiza org | eliminação do titular | idem acima | 🔴 inexistente |
| `outbox_messages` (processadas) | 30 dias após `processed_at` | idade | hard delete (job a criar) | 🟡 proposto (baixo risco: payload já redigido) |
| Backups cifrados | flag `--retention` existente | idade do artefato | prune (já implementado) | ✅ implementado |

## Por que estes prazos

- `password_resets`: resíduo zero é o estado seguro (token já inútil após uso/expiração).
- Refresh revogadas (90d): janela forense para investigar reuse sem acumular para sempre.
- Audit (2 anos, configurável): equilíbrio entre accountability e minimização; Marco Civil (6m–1a p/ logs) é piso, não teto, para trilha de segurança — **Encarregado/jurídico decide o número final**.
- Outbox (30d): payload sensível já redigido; restante é metadado operacional.

## Estratégias aplicáveis (skill)

- Hard delete: resets, refresh revogadas, outbox processado, DSAR deferido.
- Soft delete + bloqueio: **não adotado** — sem retenção legal parcial identificada hoje; reavaliar se surgir obrigação fiscal/trabalhista sobre estes dados.
- Crypto-shredding/anonymização: desnecessários no volume/complexidade atual; reavaliar se analytics for introduzida.

## Próximos passos (changes OpenSpec, fora desta auditoria)

1. Job `audit.purge` + `AUDIT_RETENTION_DAYS` (destrutivo — change dedicada + backup prévio).
2. Job de purge de refresh revogadas + outbox processado.
3. Endpoint DSAR de eliminação com cascade (L7, `lgpd-dsar`).
