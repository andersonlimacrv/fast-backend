## Context

Throttling `(ip, email)` pressupõe IP real; `_client_ip` existe em 2 cópias e confia em header forjável. Deploy canônico termina TLS no Caddy (`DEPLOYMENT.md`), ou seja há 1 hop real em prod — mas nada no código distingue hop real de forjado.

## Goals / Non-Goals

Goals: IP real por padrão (fail-closed), hops explícitos, sem duplicata. Non-goals: rate-limit (outra change), parsing de `Forwarded` RFC 7239.

## Decisions

1. **Fail-closed `0` como default** — sem config, header é ignorado; operador atrás de proxy opta por `1` conscientemente. Rejeitado: default `1` (abre spoof em quem não lê o runbook).
2. **Hops contados da direita** (últimos N são os proxies confiáveis mais próximos) — padrão de `ProxyHeadersMiddleware`. Rejeitado: primeiro hop (é o mais forjável).
3. **Helper único em `infrastructure/`** — routers só chamam; duplicata em `admin/router.py` removida. Rejeitado: parâmetro via `Request.state` (acoplamento implícito).
4. **Sem nova dependência** — parsing é split/strip; `uvicorn[standard]` já traz o middleware alternativo.

## Risks / Trade-offs

- [Operador com 2 proxies e hops=1 lê IP do proxy intermediário] → runbook manda contar os hops do próprio deploy; teste documenta a regra.
- [Muda throttle key de quem estava atrás de proxy honesto sem config] → comportamento anterior era inseguro; aceite registra a quebra intencional.

## Migration Plan

Só código + setting com default seguro; rollback = revert. Sem migração.
