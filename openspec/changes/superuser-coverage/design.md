## Context

Control plane admin entregue em `2026-09-15-A-admin-control-plane` (ADR 0005): `users.is_staff` + `CHECK (superuser ⇒ staff)`, `uq_single_root`, CLI one-shot com `BOOTSTRAP_KEY`, módulo folha `app/modules/admin/` (policies puras, `require_staff/require_root`, endpoints-ação), auditoria via `audit.metadata`. Cobertura existente: `test_admin_control_plane.py` (matriz só no overview, revoke sem teste, 409 frouxo), `test_bootstrap_root.py` (melhor cobertura), `test_admin_policies.py` (unit), `test_tenant_isolation.py` + `test_tenant_repository.py` (bypass explícito ok).

## Goals / Non-Goals

Goals: matriz RBAC pinada por rota, revoke coberto, 409 estrito, bootstrap genérico assertado, decisão `reason` registrada. Non-goals: qualquer mudança de runtime além da eventual obrigatoriedade de `reason`; UI; RLS.

## Decisions

1. **Só testes, sem comportamento novo** — nenhum endpoint, policy ou migração muda; exceção única possível é o `reason` (item 2). Rejeitado: aproveitar para endurecer policies (vira outra change).
2. **`SuperuserContext.reason`: decisão do dono antes de implementar** — hoje `reason: str = "support"` (`tenancy/repository.py:10-13`). Opção A: tornar obrigatório (contrato mais forte; quebra `admin/service.py:54` `reason="admin overview"` e `test_tenant_repository.py:18`). Opção B: manter default + teste "todo uso admin passa reason explícito" (varredura). Recomendação: B (sem quebra), salvo se o dono preferir o aperto.
3. **Matriz parametrizada, não cópia por rota** — um teste parametrizado percorre as rotas (`router.py:31-203`) com os 4 papéis; falha localizada por id do parâmetro. Rejeitado: repetir bloco por rota (churn).
4. **Postgres real, sem mock de isolamento** — `RULES.md §5`: mock de repository não prova isolamento de tenant; Testcontainers obrigatório nos testes de bypass.

## Risks / Trade-offs

- [Matriz parametrizada pode mascarar particularidades (ex. `force-password-reset` retorna `accepted`)] → casos especiais fora da matriz, teste dedicado.
- [Tornar `reason` obrigatório quebra 2 call sites] → só com aprovação explícita em 1.1 + complemento de ADR se virar comportamento.

## Migration Plan

Só testes; rollback = revert. Sem migração Alembic. Se 1.1 = opção A, migração de código em 2 arquivos + ajuste de 1 teste unit, ainda sem migração de banco.
