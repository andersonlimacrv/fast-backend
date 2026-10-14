# v2-coverage-audit — tasks

## S0 — Change

- [x] 0.1 `openspec/changes/v2-coverage-audit/{proposal,tasks,design}.md` + owner mandate (2026-10-13)

## S1 — Read (done)

- [x] 1.1 Full read of `references/implementation_v2.md` (§§1–23 + tail notes)
- [x] 1.2 Code layout: `app/{core,infrastructure,modules}/`, composition in `app/main.py`, contracts, services
- [x] 1.3 Pointer census: every `implementation_v2` / `components_to_use` mention in the repo

## S2 — Verify (closed 2026-10-13, exact evidence)

- [x] 2.1 `crudauth` absent from `pyproject.toml` + `uv.lock` — zero matches (case-insensitive grep)
- [x] 2.2 Markers `unit|integration|e2e|slow|security` in `pyproject.toml:55-61` (`--strict-markers`), `testpaths=["app/tests"]`, `asyncio_mode="auto"`. NOTE: no `fail_under` floor in config — ≥80% is reported, not enforced
- [x] 2.3 Guide tests exist by name: `test_refresh_reuse_revokes_entire_family` + `test_concurrent_refresh_single_winner` (`test_refresh.py:35,50`), `test_tenant_never_sees_data_from_another_tenant` + row/single/superuser-explicit/no-bypass (`test_tenant_isolation.py:21,46,73,82,97`), `test_triple_delivery_single_effect` (`test_billing.py:57`)
- [x] 2.4 `import-linter` enforced by `test_architecture.py` gates (`test_contracts_hold_on_clean_tree`, cross-module/provider-imports rejections) + `[tool.importlinter]`; CI `ci.yml` has lint/unit/integration/security jobs (`make lint`)
- [x] 2.5 Domain errors in `app/core/errors.py` (`RefreshTokenReuseError:20`, `EntitlementDeniedError:60`; tenant-denied as `OrganizationAccessDeniedError`+`ResourceNotFoundError` — covered-equivalent); zero `raise`/import of `HTTPException` in `core|modules|infrastructure` (only docstring mentions)
- [x] 2.6 Identity ops complete: `register/login/refresh/logout(+_everywhere)/invalidate_tokens/change_password` (`identity/service.py:68,102,130,158,164,167,177`)
- [x] 2.7 Audit has no update/delete statements (append-only holds)
- [x] 2.8 `scripts/backup.py` has `backup_postgres` + `restore_postgres` + retention/prune; `test_backup.py` in integration
- [x] 2.9 Immutable SHA tags (`deploy.yml:39` `tags: …:${{ steps.meta.outputs.sha }}`) + `rollback.yml` exist. NOTE: expand/contract strategy not explicitly documented anywhere
- [x] 2.10 README answers the six §16 questions (what/start/local/test/build/deploy) + backup/structure/skills/privacy
- [x] 2.11 Dev compose binds PG/Redis to localhost env ports only; `docker-compose.prod.yml` publishes no DB ports. NOTE: non-root container user not verified
- [x] 2.12 `app/infrastructure/storage/s3.py` exists (`S3CompatibleStorage`, wired `main.py:79`); MinIO covered via S3-compatible API per contract docstring — v2's `MinIOStorage`-by-name not built, accepted

## S3 — Decide

- [x] 3.1 `§2.3 question` DECIDIDO (a) 2026-10-13: flags-as-registry aceito; `AGENTS.md:11` corrigido (lista conceitual, sem runtime); `docs/RULES.md` §2 já documentava a realidade — nenhum código alterado, nenhuma change nova
- [x] 3.2 Owner approves the disposition table — approval gates Phase 2/3. APROVADO 2026-10-13. Phase 2: nothing (no confirmed gaps). Next: Phase 3 — owner deletes `references/implementation_v2.md` + `references/components_to_use/`, then agent runs the §4 pointer sweep in a follow-up change
- [ ] 3.3 No commit without request
