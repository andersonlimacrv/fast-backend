# Transferências Internacionais — avaliação L13 (2026-09-16)

**Skill**: `lgpd-international-transfer` (Arts. 33–36 + Res. 19/2024).
**Estado**: nenhuma transferência ocorrendo (sem deploy produtivo, billing off).

## Política de residência (vale desde já)

1. Preferir regiões BR (provedores com datacenter BR) para Postgres/objetos.
2. Operador fora do BR só com hipótese do Art. 33 documentada **antes** do primeiro tráfego.
3. Caminho padrão: Art. 33, II, (b) — Cláusulas-Padrão Res. 19/2024, integrais, sem alteração.

## Operadores avaliados

### Stripe (EUA) — potencial, flag off
- **Operador**: Stripe, Inc. — **País**: EUA
- **Finalidade**: webhooks de assinatura → grants (somente se `BILLING_ENABLED`)
- **Dados**: `event_id`, tipo, `price_id`, `org_id` (sem cartão, sem e-mail nosso)
- **Hipótese do Art. 33**: II, (b) cláusulas-padrão (a assinar na ativação)
- **Cláusulas-Padrão**: pendentes — anexar aqui ao ativar
- **Sub-operadores**: conforme DPA Stripe (anexar)
- **Salvaguardas**: HMAC + idempotência no nosso lado; TLS
- **Avaliação de adequação**: pendente (reavaliar na ativação)
- **Próxima revisão**: na ativação da flag, depois semestral

### SMTP / S3 / VPS futuros
- **País**: a definir por deploy (preferir BR)
- **Hipótese**: a definir — se fora do BR, II (b) antes do primeiro tráfego
- Detalhe nas fichas de `.lgpd/vendors/`; atualizar este arquivo ao contratar.

## Status (formato da skill)

- 0 operadores fora do BR em operação
- 0 com cláusulas-padrão assinadas
- 1 pendente condicional: Stripe (só se flag ligada)
- Próximo: revisão anual de vendors (ou ao contratar)
