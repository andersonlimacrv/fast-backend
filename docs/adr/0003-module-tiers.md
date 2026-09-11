# ADR 0003 — Tiers de módulos (`CORE_MODULES` vs opcionais)

- Status: aceito
- Data: 2026-09-11
- Decisão do usuário: nomenclatura `CORE_MODULES` (não `PLATFORM_MODULES`).
- Referência congelada: `references/implementation_v2.md` §2.3

## Decisão

```python
CORE_MODULES = ["identity", "organization", "tenancy", "entitlements", "health"]
OPTIONAL_MODULES = ["billing_stripe", "audit", "notifications_email", "storage_s3", "ai"]
# ENABLED_MODULES=billing_stripe,audit,notifications_email  (só plugáveis reais)
```

- `identity/organization/tenancy/entitlements/health` nunca são "desligáveis".
- `entitlements` é core leve (tabela + dependency, ex. `projects.max`, `ai.enabled`), funciona sem Stripe.
- Opcionais são folhas do DAG, consomem `public.py`/contracts/eventos, nenhum core depende deles.
- DAG: `identity → organization → tenancy → entitlements` (seta = import permitido). Enforçado no CI com `import-linter`.
