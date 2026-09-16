# Gap Analysis e Plano de Remediação — 2026-09-16

## Resumo
- 3 gaps críticos
- 4 gaps altos
- 3 gaps médios
- 1 gap baixo

## Cobertura já existente (não duplicar)
`docs/PRIVACY.md`+pt-BR, `test_leak_audit.py`, purge de `password_resets`, redação do outbox, anti-enumeração testada, `PRIVACY_CONTACT` documentado (sem default).

## Ações imediatas (próxima semana)
1. **Designar Encarregado e publicar contato** — operador, ASAP
   - Skill a executar: lgpd-dpo-encarregado
2. **Publicar runbook de incidente (Res. 15/2024)** — operador
   - Skill: lgpd-incident-response
3. **Canal DSAR mínimo** (solicitar/acompanhar por e-mail dedicado + endpoint `DELETE /auth/account` com cascade auditado) — change OpenSpec
   - Skill: lgpd-dsar

## Próximas 2-4 semanas
4. ROPA formal a partir do discovery — lgpd-data-mapping + lgpd-ropa
5. Due diligence + DPA dos operadores ativos (SMTP/S3/Stripe por deploy) — lgpd-vendor-audit + lgpd-dpa
6. Base legal por atividade documentada — lgpd-legal-basis
7. Retenção do `audit_log` (`AUDIT_RETENTION_DAYS`, hoje sem purge) + famílias refresh revogadas — lgpd-retention-erasure

## Próximo trimestre
8. Endpoint de eliminação total (hard delete + cascade + prova) — lgpd-dsar
9. RIPD para auth/admin (alto risco) — lgpd-ripd
10. Transferências internacionais (Stripe US e afins, Res. 19/2024) — lgpd-international-transfer

## Backlog
11. Treinamento anual da equipe
12. ECA Digital: confirmado N/A (reavaliar se o produto ganhar público menor)
13. Consent ledger: N/A (sem marketing/cookies) — reavaliar se surgir tracking

## Tabela sistemática

| Item | Status | Evidência | Severidade |
|---|---|---|---|
| Base legal documentada por atividade | RED | só menções em PRIVACY.md, sem matriz | crítica |
| ROPA existe | RED | nenhum formal (só discovery) | crítica |
| Encarregado designado/publicado | RED | placeholder | crítica |
| Runbook de incidente | RED | nenhum | alta |
| Canal DSAR | YELLOW | só admin disable; sem autoatendimento | alta |
| Endpoint de eliminação | RED | nenhum (só disable) | alta |
| Retenção do audit definida | RED | append-only sem purge | alta |
| DPA com operadores | RED | nenhum | alta |
| Criptografia em trânsito | GREEN | TLS via Caddy (deploy) | - |
| Hashing de credenciais | GREEN | Argon2id + segredos fora de logs (testado) | - |
| Minimização (sem trackers) | GREEN | zero terceiros no client | - |
| Anti-enumeração | GREEN | testes de indistinguibilidade | - |
| ECA Digital | N/A | B2B dev, sem menores | - |
