# ADR 0008 — Metadados públicos de release (`GET /meta`)

- Status: aceito (implementado na change `backend-release-meta`, 2026-09-15: endpoint + `APP_VERSION` + teste anti-vazamento)
- Data: 2026-09-15
- Referência congelada: `references/implementation_v2.md` §21 (não-fazer: sem telemetria além do proporcional)

## Contexto

A landing pública precisa de nome, versão e módulos+flags a partir do backend. Não existia endpoint nem `APP_VERSION`. Alternativa (hardcode no client) duplicaria a fonte da verdade.

## Decisão

1. `GET /meta` em `app/interfaces/meta.py` (transversal, sem dono de domínio — segue `health.py`): `{app, version, modules:[{key, enabled}]}`; núcleo com `enabled:true` literal; `admin`/`billing` refletem flags; sem auth, sem DB, sem PII.
2. `APP_VERSION` explícito (default `"0.1.0"`; release injeta da tag — tags são a verdade). Rejeitado: `importlib.metadata` (acopla empacotamento).
3. Princípio de allowlist: payload construído só de literais; teste unit varre o body contra substrings proibidas (`secret|token|smtp|postgres|redis|email|host|…`).
4. Sem throttle dedicado (resposta estática barata sob hardening global; reavaliar se abusado).

## Alternativas rejeitadas

- Expor `environment`/status de deps: topologia de deploy não é pública (para isso existe `/readyz` autenticado por rede, não por token — documentado, fora deste payload).
- Introspecção dos routers registrados: acopla a internals do FastAPI.

## Consequências

- Positivas: landing sempre atualizada; superfície mínima auditável.
- Negativas: versão desatualiza se o release não injetar `APP_VERSION` (mitigado: fumaça no deploy + CHANGELOG humano).
- Reversão: nova ADR + remoção da rota (nunca editar esta ADR).
