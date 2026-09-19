## Context

Throttling existe só onde há `(ip, email)` ou `(ip, token-prefix)` (login/refresh/forgot). Register não tem email-para-throttle antes de existir conta — a chave precisa ser `(ip)` ou `(ip, "register")`. Não há teto global (non-goal do hardening, `proposal.md:35` do archive).

## Goals / Non-Goals

Goals: register throttled antes do Argon2, teto global anti-abuso, 429 sem oráculo. Non-goals: WAF, captcha, quota por usuário, IPv6/CGNAT fairness fina.

## Decisions

1. **Check antes do Argon2, record só em falha** — o custo CPU é o que se protege; 201 nunca consome balde (evita lockout de NAT legítimo que registra muitos). Rejeitado: throttlear após sucesso.
2. **429 indistinguível** — mesmo status/corpo para email novo/existente/throttled (ADR 0009 estendido ao throttle). Rejeitado: 429 só para existente (vira oráculo).
3. **Reusar backend Redis do `LoginThrottler`** — mesma primitiva incr+expire, chave com namespace por escopo. Rejeitado: slowapi/nova dep (120 linhas nossas resolvem, padrão ADR 0011).
4. **Teto global alto (anti-abuso, não quota)** — legítimo nunca encosta; valores em settings para o operador apertar. Rejeitado: teto baixo global (quebra NAT corporativo).
5. **Ordem com `proxy-hops-trusted`** — IP real primeiro; esta change implementa sobre `request.client` e rebaseia (registrado em tasks 4.2).

## Risks / Trade-offs

- [Teto global como dependência de roteador] → roda ANTES do auth (anti-scrape anônimo conta); implementado via `dependencies=[Depends(...)]` no router (não no corpo) após review.
- [`Retry-After` distingue magnitudes de janela (register 3600 vs demais 60)] → aceito e documentado: revela escopo, nunca conta; corpos idênticos provados em teste.
- [NAT/CGNAT compartilha balde] → tetos altos + record-só-em-falha mitigam; documentado.
- [Testes de rajada lentos] → janelas curtas via settings de teste, Redis real obrigatório.

## Migration Plan

Só código + settings com defaults seguros; rollback = revert. Sem migração.

## Rebase sobre `proxy-hops-trusted` (tasks 4.2)

Implementado sobre o working tree da `proxy-hops-trusted` (não reintroduz
parsing de `X-Forwarded-For`): as chaves de throttle usam o IP real dela — o
teto global resolve via `app.core.contracts.audit.client_ip` (regra canônica,
fail-closed com `trusted_proxy_hops=0`) em
`app/infrastructure/security/rate_limit.py`, e o `register` recebe o IP do
`_client_ip` já migrado dos routers. Nenhum teste de spoof duplicado aqui
(cobertos por `test_proxy_hops.py`); escopo desta change provado em
`test_rate_limit_global.py`. Sem conflito de settings (campos disjuntos).
