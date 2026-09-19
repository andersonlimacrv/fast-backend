## 1. Setting + helper

- [x] 1.1 `Settings.trusted_proxy_hops: int = 0` + validação (negativo → erro; documentar prod-atrás-de-proxy no runbook)
- [x] 1.2 Helper único de IP real em `infrastructure/` (hops confiáveis da direita p/ esquerda; `0` = ignora header); os 2 routers consomem, duplicatas removidas
- [x] 1.3 `.env.example` (`TRUSTED_PROXY_HOPS=0` comentado) + `env_check` se aplicar

## 2. Testes (Postgres/Redis reais onde tocar throttle/audit)

- [x] 2.1 Spoof com hops=0 → throttle key + `audit.ip` usam `request.client.host`
- [x] 2.2 hops=1 → usa o último hop do `X-Forwarded-For`
- [x] 2.3 Sem header → `request.client.host` (comportamento atual preservado); `unknown` quando sem client

## 3. Docs + gates

- [x] 3.1 `DEPLOYMENT.md` (+pt-BR): quando usar hops vs `ProxyHeadersMiddleware` + `--proxy-headers`
- [x] 3.2 Gates: `pytest -m unit`, `pytest -m integration`, `ruff`, `mypy`; `git status` só escopo
