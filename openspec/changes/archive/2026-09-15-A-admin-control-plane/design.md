## Context

v1.0.0 sem control plane; `/client` precisa de contrato admin multi-projeto. Upstream tem OAuth/sudo prontos, mas ADR 0001 exige ownership (Argon2id, JWT curto, refresh com family/reuse/`FOR UPDATE`, `tokens_valid_after` só em `CurrentPrincipal` — v2 §3). Layout flat `app/` (ADR 0004), DAG `identity → organization → tenancy → entitlements` + folhas (RULES §4, ADR 0003).

## Goals / Non-Goals

**Goals:** root único auditável fora do HTTP; staff com privilégio mínimo; admin como operações de sistema (não CRUD de ORM); bypass sempre explícito e auditado.
**Non-Goals:** UI, recovery, social, impersonation, suspensão de org, RLS.

## Decisions

1. **CLI em vez de endpoint/seed** — endpoint cria superfície pré-autenticada + corrida; seed recria em restart com env vazado. CLI usa `getpass` + `compare_digest`, testável sem servidor.
2. **`is_superuser=root` + `is_staff` novo** — reutiliza coluna (compat com `Principal`); `is_staff` evita sobrecarregar owner/admin por-org. Rejeitado: grant `admin:global` (acoplaria entitlement por-org a authz global).
3. **`admin` folha** — só `*/public.py` + contracts; novo contrato `import-linter`; `__init__.py` + `public.py` por convenção dos módulos.
4. **Endpoints-ação, nunca PATCH de flags** — elimina privilege escalation por construção (`POST /users/{id}/disable`, `POST /staff/{id}/grant` root-only, sem rota para `is_superuser`).
5. **Contextos distintos** — `CurrentPrincipal` (quem), `CurrentTenant` (qual tenant), `AdminContext` (nível global), `SuperuserContext` (ultrapassar restrição). Proíbe `if is_superuser` fora de `admin/dependencies.py`.
6. **AdminAction via `audit.metadata`** — `audit_log` já tem actor/action/resource/metadata/ip/ua (`audit/models.py:19`); nova tabela duplicaria. Service valida `reason+success`.
7. **Superfícies aditivas nos services** — counts/listagens globais como métodos novos + `public.py`; sem alterar comportamento existente.
8. **`is_active` mantido** — enum de status quebraria `0001_initial` + backups; disciplina (só via disable/enable) em vez de migração.

## Risks / Trade-offs

- [CLI exige shell → runbook VPS + `make admin-bootstrap`] → documentar em DEPLOYMENT.
- [`GET /admin/users` expõe PII → paginação + sem email em overview + audit de leitura global (root)] → matriz RBAC nos testes.
- [Staff global ainda é poder alto → mutações exigem `reason`, audit obrigatório, falha-fechada sem recorder] → `security-auditor` revisa.
- [Alternativa rejeitada: SQLAdmin como autoridade → `/admin → ORM → UPDATE` ignora policies] → SQLAdmin no máximo ferramenta dev futura (só triagem).

## Migration Plan

Expand-only `0006_admin_staff`: `users.is_staff DEFAULT false`, `CHECK (NOT is_superuser OR is_staff)`, `uq_single_root WHERE is_superuser`. Downgrade reverso. Deploy: migrate → smoke → bootstrap manual → `GET /admin/overview`. Rollback = não promover (archive só após verify).

## Open Questions

- Nenhuma bloqueante. Nome `is_staff` fechado (feedback aprovado).
