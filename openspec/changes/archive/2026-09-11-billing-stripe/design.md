## Context

Pós-Fase 6: entitlements legíveis/escritos, outbox com claim atômico, grants geridos por admin. Billing é "só" um produtor confiável de grants a partir de verdade externa (Stripe).

## Goals / Non-Goals

**Goals:**
- Webhook Stripe → grants, com duplicata inofensiva e assinatura verificada.
- Core 100% funcional com a flag desligada.

**Non-Goals:**
- Qualquer fluxo de cobrança iniciado pelo backend (checkout, portal, invoices).

## Decisions

1. **Outbox como registro do evento (`stripe:{id}`)** — redelivery vira re-enqueue → mesma linha; o efeito só roda na transição para `processed`. Sem tabela nova.
2. **SDK `stripe` só para `Webhook.construct_event`** — verificação HMAC + tolerância via SDK (não reimplementar crypto); chamadas de rede do SDK não existem neste fluxo. O SDK é síncrono: `construct_event` é CPU/HMAC puro (rápido, sem I/O), então chamada direta é aceitável; documentado.
3. **Efeito via `entitlements.public`** — billing (folha) consome core; `price → {key, limit}` em `STRIPE_PRICE_MAP` (JSON em settings); preço desconhecido → evento registrado, sem efeito, logado (não 500 — Stripe reentrega 500s).
4. **`deleted` desliga em vez de apagar** — `enabled=false` preserva histórico e permite reativação.
5. **Raw body obrigatório** — `await request.body()` antes de qualquer parse; JSON só após assinatura válida (não confiar em campo `livemode`/`id` antes).
6. **Flag em `main.py`, não em runtime por request** — router ausente = 404 honesto; teste "core sem billing" = suite Fase 1–6 com defaults.

## Risks / Trade-offs

- [Evento válido com preço fora do mapa] → registrado sem efeito + warning; mitigação: alerta via audit/log + documentar mapeamento obrigatório.
- [Relógio dessincronizado estoura tolerância] → 400 legítimo vira reentrega; mitigação: NTP no runbook + tolerância configurável.
- [Segredo vazado permite forjar eventos] → mitigação: segredo só por env, rotação manual documentada, `enabled=false` + reemissão em caso de incidente.
- [Alternativa rejeitada: tabela `stripe_events` própria] → duplicaria o outbox; não.
