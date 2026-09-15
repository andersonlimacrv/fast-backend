# ADR 0005 — Root único + admin central (client como admin multi-projeto)

- Status: aceito (implementado e verificado na change `A-admin-control-plane`, 2026-09-15: 9 testes de integração + unit policies verdes, gates `ruff/mypy/lint-imports/bandit` limpos)
- Data: 2026-09-15
- Referência congelada: `references/implementation_v2.md` §4 (boundaries), §6 (tenancy/RBAC), §23
- Decisão do usuário: bootstrap via CLI + `BOOTSTRAP_KEY`; hierarquia `root > staff > owner/admin/member`; dashboard backend-only agora

## Contexto

O `/client` vai administrar este e futuros projetos (verificar contas, gerenciar usuários/orgs). `users.is_superuser` existe sem autorização (`app/modules/identity/models.py:23`, `dependencies.py:25`). Criar privilegiados por SQL manual é inauditável e intestável. Precisamos de root criado uma única vez via segredo do `.env`, capaz de criar admins e demais tipos, com dashboard consumindo contrato backend.

## Decisão

1. `is_superuser=true` = **root global** (único, índice parcial `uq_single_root WHERE is_superuser`). Bypass cross-org só via `SuperuserContext(reason=...)` explícito e auditado (`tenancy/repository.py:10`).
2. Nova coluna `users.is_staff` = **admin central de escopo limitado** (gerencia contas/orgs/memberships, sem bypass irrestrito). Invariante `is_superuser ⇒ is_staff` via `CHECK (NOT is_superuser OR is_staff)`. Papéis por-org `owner|admin|member` inalterados.
3. Só root gerencia staff/root (`POST /admin/staff/{id}/grant|revoke`); staff nunca cria staff/root. Último root nunca removido/desabilitado (`LastRootProtectedError` → 409, irmão de `LastOwnerProtectedError`).
4. Bootstrap exclusivamente via `scripts/bootstrap_root.py` (CLI, `hmac.compare_digest` com `BOOTSTRAP_KEY`, `getpass` p/ senha, falha-fechada na 2ª tentativa). Sem endpoint HTTP.
5. Novo módulo folha `app/modules/admin/` (flag `ADMIN_ENABLED`, default on): `dependencies` (`require_staff/require_root`, `AdminContext` — único lugar que lê `is_*`), `policies` (puras), `service`, `router` (`/admin/*` backend-only), `schemas` (sem `is_*` para escrita), `public`. DAG: consome só `*/public.py` + `core/contracts/*`; novo contrato `import-linter` (RULES §4, ADR 0003).
6. Admin ≠ CRUD: endpoints-ação explícitos (`disable/enable/revoke-sessions/grant/revoke`, memberships com proteção de último owner). Suspensão de org adiada (sem coluna de status; alternativa destrutiva rejeitada).
7. AdminAction via `audit.metadata={reason,success,...}` (sem tabela nova); mutação exige `reason` ≥8 chars; sem audit ativo o admin falha-fechada.

## Alternativas rejeitadas

- Endpoint `POST /admin/bootstrap` one-shot: superfície HTTP pré-autenticada + corrida + rate-limit extra.
- Seed no startup: recriação acidental em restart com env vazado.
- Grant `admin:global` em entitlements: acoplaria entitlement por-org a authz global.
- SQLAdmin/CRUDAdmin como autoridade: `/admin → ORM → UPDATE` ignora policies; no máximo ferramenta dev futura (só triagem, sem instalar).
- `PLATFORM_MODULES`: rejeitado pela hierarquia (nomenclatura `CORE_MODULES` congelada, RULES §2).
- Tabela `admin_actions` dedicada: duplicaria `audit_log`; metadata validada basta.

## Consequências

- Positivas: root auditável (`root.bootstrap`, `admin.*` com reason), testável em CI sem servidor, single-root garantido no DB, escalation por PATCH eliminado por construção.
- Negativas: exige acesso shell (`make admin-bootstrap` + runbook VPS); multi-root futuro exige migração; `GET /admin/users` expõe PII (paginação + audit de leitura).
- Reversão: nova ADR removendo `is_staff`/router; índice parcial dropado em migração própria (nunca editar esta ADR).
