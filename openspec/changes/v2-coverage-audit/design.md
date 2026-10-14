# v2-coverage-audit — design

Audit of `references/implementation_v2.md` (46 KB, §§1–23 + tail), read in full
2026-10-13 against `app/`, `docs/`, `client/src/lib/catalog/` and CI config.
Dispositions: `covered` / `covered-equivalent` / `deferred` / `diverged-recorded`
/ `question`. `verify:` items are closed in tasks.md S2 with exact commands.

## §1 Dispositions

| v2 section | Disposition | Evidence / new home |
|---|---|---|
| Decisões congeladas (table) | covered | `docs/RULES.md` §3 + code: pwdlib Argon2id, JWT HS256 10–15min, opaque PG refresh + rotation/reuse/atomic, `tokens_valid_after`, `single\|row`, no RLS |
| Abandono crudauth | covered (+verify 2.1) | `docs/adr/0001-remove-crudauth.md` |
| Top 10 gaps | covered | All ten have homes: §§3/4/identity/org/RBAC/observability/email/storage/jobs/audit/billing — see rows below |
| §1 Gap Analysis | covered | Same as decisions table |
| §2.1 tree + regra estrutural | covered-equivalent | `app/` ≡ `backend/src/` (`docs/adr/0004-app-dir.md` mapping); contracts `email/storage/payments` exist (`app/core/contracts/`); infra `auth/{hashing,jwt,refresh_tokens,throttling}`, `db`, `storage/{local + S3-compatible}`, `email`, `observability`, `jobs` all exist; `notifications_email` is NOT a module — email runs via infra + outbox + worker (capability complete, accepted shape); `storage_s3`/`ai` not modules — infra adapters + future (see §2.3, §22) |
| §2.2 coupling + DAG + import-linter in CI | covered (+verify 2.4) | `docs/RULES.md` §62 (`layers`, `core-independence`, per-module internals contracts); DAG `identity→organization→tenancy→entitlements`, optionals as leaves |
| §2.3 `module_registry.py` (`PLATFORM_MODULES`, `ENABLED_MODULES`) | **decided (a) 2026-10-13 — flags-as-registry accepted, no implementation change** | No `module_registry.py`, no `CORE_MODULES`/`ENABLED_MODULES` string anywhere in `app/`; composition is flag-driven in `app/main.py:90,118,120` (`billing_enabled`, `admin_enabled`) + adapter selection (`email_backend`, `storage_backend`, `main.py:78-79`). `AGENTS.md:11` corrected to match `docs/RULES.md` §2 (conceptual list, no runtime). NOTE: v2 tail line 1856 already records "Pode usar CORE_MODULES" — and tail lines 1856–58 are post-freeze working notes appended to the "frozen" doc, i.e. the freeze was breached once before; cited as supporting evidence for the owner's deletion rationale, not as license for further silent edits |
| §§3.1–3.5 auth core (hashing/JWT/refresh/rotation/reuse/`tokens_valid_after`) | covered (+verify 2.3, 2.5) | `app/infrastructure/auth/` + `CurrentPrincipal` resolution; family revocation on reuse |
| §3.6 `CurrentPrincipal` + future transports | covered | Transports beyond JWT recorded as future (`docs/adr/0001`, `0007-social-contract`) |
| §3.7 Identity ops + no-`HTTPException`-in-domain | covered (+verify 2.5, 2.6) | `AuthenticationService` (`app/modules/identity/service.py:41`); reviewer checklist enforces the boundary |
| §§4.1–4.3 tenancy (`single\|row`, `active_org_id`-as-context, `TenantScopedRepository`, `SuperuserContext`, switch-org endpoint) | covered | `docs/adr/0002-tenancy-model.md`; `docs/ROADMAP.md:39` |
| §4.4 RLS | deferred | `docs/adr/0002` + `docs/RULES.md:42` + `docs/SCALING.md:22-28` (adopt only on client demand; revisit pooling first). No action |
| §4.5 + §§6.4–6.6 guide tests (reuse/concurrency/isolation/idempotent-webhook, real PG, no-mock-isolation) | covered (+verify 2.3) | Tester doctrine (`tester.md`); 179 backend tests (90 unit + 89 integration) |
| §5 roadmap phases 0–8 | covered | v1.0.0 delivered (tag `0.1.0`); phases 9–11 are post-v2 scope, recorded in `CHANGELOG.md` |
| §§6.1–6.3 TDD (pyramid 70/25/5, layout, markers, Testcontainers, ≥80%, risk rigor) | covered (+verify 2.2) | `app/tests/{unit,integration,e2e,fixtures}/`, `asyncio_mode=auto` |
| §7 outbox/idempotency (logical-only, never physical exactly-once) | covered | `OutboxService` + `stripe:{id}` pattern (`docs/ARCHITECTURE.md:40`); "idempotência lógica" frozen |
| §8 storage (`ObjectStorage`, local→MinIO→S3, never `module→boto3`) | covered (+verify 2.12) | `app/core/contracts/storage.py` + `LocalFilesystemStorage` + `S3CompatibleStorage` |
| §9 email (`EmailSender`, Jinja2+SMTP+aiosmtplib, Mailpit dev, Resend/SES future) | covered | `app/core/contracts/email.py` + `SmtpEmailSender`/`LogEmailSender` + worker tasks + outbox |
| §10 billing (optional `billing_stripe`, `PaymentProvider`, webhook→idempotency→entitlements) | covered | `app/modules/billing_stripe/` + `StripePaymentProvider`, flag-gated, core works without it |
| §11 audit (append-only `audit_log`, prioritized sensitive actions, no indiscriminate logging) | covered (+verify 2.7) | `app/modules/audit/` (`AuditService`); read-path PII caveat in `docs/adr/0005` |
| §12 observability (base mandatory; Prometheus/Grafana/OTel future-proportional) | covered | Structured logs + `request_id` + `/healthz` + `/readyz` + centralized errors; stack deferred by design |
| §13 VPS checklist | covered | `docs/DEPLOYMENT.md` (TLS, cookies+CSRF per `settings.py:182`, CORS, proxies, rate-limit, secrets); no-secret-leak covered (`test_leak_audit.py`); containers/compose exposure → verify 2.11 |
| §14 backup (dump→compress→encrypt→off-site; "backup restores" + drill as acceptance) | covered (+verify 2.8) | `scripts/backup.py` + `docs/DEPLOYMENT.md` backup section |
| §15 CI/CD (ruff→mypy→unit→integration→security→image; immutable tags; rollback; expand/contract) | covered (+verify 2.4, 2.9) | `.github/` workflows + auto-release |
| §16 docs (README six questions; `docs/{architecture,development,deployment,modules,guides,adr}`) | covered-equivalent | Flat `docs/` + `guides/` + `adr/` instead of the proposed subfolders (accepted shape; verify 2.10 for README) |
| §17 AI-agent friendly (root `AGENTS.md`; per-module `AGENTS.md` optional) | covered | Root `AGENTS.md` + `.opencode/agents/` (9 agents); per-module files not adopted — v2 itself marks them optional, no action |
| §18 add/remove module (5 steps) | covered | `docs/guides/add-module.md` (+`.pt-BR`) |
| §19 naming (entities/schemas/`*Service`/contracts/adapters/exceptions; no `HTTPException` in domain) | covered (+verify 2.5) | `AuthenticationService`, `OrganizationService`, `EntitlementService`, `BillingService`, `AuditService`, `AdminService`, `ProjectService` present |
| §20 security boundaries (auth≠authz≠tenant≠entitlement≠audit; layered flow) | covered | `docs/RULES.md` §6 + reviewer checklist |
| §21 não-fazer | deferred | `docs/RULES.md:90` (K8s, microservices, Kafka, CQRS, schema/db-per-tenant, OTel/Rust-style mandatory stack…). No action — implementing this list would be the absurd reading of "cover everything" |
| §22 resultado/extensões (`ai` as optional leaf) | covered-equivalent | Billing/audit are modules; email/storage are infra+adapters; `ai` future. No action |
| §23 final decisions (+ tail notes) | covered | `docs/RULES.md` §3 + code; tail working notes are historical (see §2.3 NOTE) |

## §2 `components_to_use/` deletion readiness

Porting queue at zero (23/23 docs consumed; 26 catalog entries, all `validated`;
sources exist on disk — verified 2026-10-09 session). Nothing reads the folder
at build/test/runtime: only comments (`circular-progress.tsx:7`,
`app-sidebar.tsx:202`), `ref`/`refGroup` strings (`entries.ts`, `types.ts`),
and archived-change narratives. Deletion consequences, all handled in Phase 3:
keep `ref`/`refGroup` as historical strings (origin trail, not stripped);
`docs/review-design.md` keeps its contrast narrative + deletion note (history,
not rewritten); `lab-harness/design.md:28` growth rule ("new doc → append `n`")
needs the replacement inbox rule (Phase 4 decision); the 2 PNGs in `AnimateUi/`
go with the folder.

## §3 Phase 2 candidates (only if S2/S3 confirm)

- None confirmed yet. Only candidate: `§2.3 question` outcome (b) — a
  `module_registry.py`/`ENABLED_MODULES` implementation change.

## §4 Phase 3 pointer sweep (owner deletes; agent updates)

`AGENTS.md:8,64`, `docs/RULES.md:13-15`, `docs/ROADMAP.md:3,10`,
`openspec/config.yaml:6,11`, runbooks
(`planner:17`, `backend-implementer:13`, `code-reviewer:19`, `tester:12`,
`security-auditor:20`, `docs-writer:19`), catalog comments
(`entries.ts:1`, `types.ts:4,16,39`), `review-design.md` note, CHANGELOG.

## §5 Citation-resolution map (ADRs + archives NOT rewritten)

Each live "v2 §X" citation resolves via this table after deletion:

| Citation | New home |
|---|---|
| §§3.x (auth/JWT/refresh/reuse/revocation) — ADR 0001, 0006, 0009; reviewer/tester checklists | `app/infrastructure/auth/` + `docs/adr/0001-remove-crudauth.md` + `docs/adr/0006-password-recovery.md` + `docs/RULES.md` §3 |
| §2.1–2.3 (tree/DAG/registry) — ADR 0003, 0004; `openspec/config.yaml` | `docs/adr/0003-module-tiers.md` + `docs/adr/0004-app-dir.md` + `docs/RULES.md` §62 + `app/main.py` composition |
| §4 (tenancy/boundaries) — ADR 0002, 0005; admin changes | `docs/adr/0002-tenancy-model.md` + `docs/adr/0005-root-admin.md` + `docs/ROADMAP.md:39` |
| §3.6 (auth extensions) — ADR 0007 | `docs/adr/0007-social-contract.md` + `app/core/contracts/social.py` |
| §21 (não-fazer) — ADR 0008 | `docs/RULES.md:90` + `docs/adr/0008-public-release-meta.md` |
| §23 (final decisions) — all ADRs' "§23" refs | `docs/RULES.md` §3 |
| §§6.x (TDD/test guides) — tester/planner runbooks | `app/tests/` + `docs/RULES.md` §5 |
| §§13/20 (VPS/security) — security-auditor/reviewer runbooks | `docs/DEPLOYMENT.md` + `docs/RULES.md` §6 |
| §§9/11/14 (email/audit/backup ops) | `docs/DEPLOYMENT.md` + `app/infrastructure/{email,jobs}` + `scripts/backup.py` |
| §2 + `components_to_use` growth rule | Phase 4 replacement inbox rule (TBD) + this table |

## §6 Rule reminder (binding on the agent)

`docs/RULES.md:13-15` + `AGENTS.md` hierarchy still freeze `references/` for
the agent. This change only audits. Deletion (Phase 3) is the owner's action;
until then, no agent writes under `references/`.
