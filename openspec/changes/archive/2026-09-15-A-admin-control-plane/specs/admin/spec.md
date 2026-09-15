## ADDED Requirements

### Requirement: Bootstrap de root único via CLI

The system SHALL create the root (`is_superuser=true`) exclusively via `scripts/bootstrap_root.py` with `BOOTSTRAP_KEY` compared in constant time; the 2nd attempt SHALL fail closed (exit≠0) even with a valid key (partial unique index `uq_single_root`).

#### Scenario: Segundo bootstrap negado
- **WHEN** the CLI runs with a valid key while a root exists
- **THEN** exit≠0 AND no 2nd root exists AND the output reveals nothing (generic log).

### Requirement: Hierarquia root > staff > por-org

The system SHALL enforce `is_superuser ⇒ is_staff` (CHECK); only root SHALL manage staff/root; disabling or de-privileging the last root SHALL return 409 (`LastRootProtectedError`).

#### Scenario: Staff tenta criar staff
- **WHEN** staff calls `POST /admin/staff/{id}/grant`
- **THEN** 403 AND the denied attempt is audited.

### Requirement: Admin como operações auditadas com reason

Every `POST /admin/*` mutation SHALL require `reason` (≥8 chars) and SHALL record `audit.metadata={reason, success, ...}`; schemas SHALL never expose `is_superuser/is_staff` for writing.

#### Scenario: Disable sem reason
- **WHEN** `POST /admin/users/{id}/disable` without `reason`
- **THEN** 422 AND no state changes.
