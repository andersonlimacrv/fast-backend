# Operador: Stripe (flag `BILLING_ENABLED`, off por padrão)

- Razão social: Stripe, Inc. (EUA) — DPA padrão disponível no painel Stripe
- País(es) de tratamento: EUA (+ infraestrutura global Stripe)
- Finalidade: webhooks de assinatura → grants (`POST /billing/webhooks/stripe`)
- Dados compartilhados: `event_id`, tipo de evento, `price_id`, `org_id` (sem cartão, sem e-mail nosso — Stripe hospeda o checkout) | Sensíveis? não
- Tier: **Alto** (quando ligado; hoje off = sem tratamento)
- Owner interno: pendente
- Última revisão: 2026-09-16 | Próxima revisão: semestral após ativação

## Checklist (resumo)
- [ ] **🚫 DPA assinado** (aceitar DPA padrão Stripe na conta + anexar link aqui)
- [ ] HMAC + tolerância (já no código: `stripe_adapter.py`), idempotência `stripe:{id}`
- [ ] **🚫 Base do Art. 33**: Cláusulas-Padrão Res. 19/2024 ou SCCs Stripe anexadas
- [ ] Auxílio DSAR/eliminação; retenção compatível
- [ ] Incidentes ≤ 24h; canal definido

## Avaliação — Stripe
- Eliminatórios (🚫): **pendentes até ativação** (DPA + Art. 33)
- Veredito: **APROVADO COM RESSALVAS — só ligar a flag após DPA + cláusulas anexadas aqui**
- Gaps abertos: ver `.lgpd/gaps.md` (DPA com operadores)
