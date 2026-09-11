# audit Specification

## Purpose
TBD - created by archiving change audit-observability-backup. Update Purpose after archive.
## Requirements
### Requirement: Sensitive actions are audit-recorded

The system SHALL append an `audit_log` row (tenant, actor, action, resource, metadata, ip, user agent) for: login success, global logout, password change, org creation, member add/remove/role change, grant upsert.

#### Scenario: Role change leaves a trail
- **WHEN** an admin changes a member's role
- **THEN** a row exists with actor, org, action, resource and timestamp

### Requirement: Audit is append-only and admin-readable

The system SHALL offer no update/delete path for audit rows; org `admin+` may list their org's trail, `member` is denied.

#### Scenario: Member reads audit
- **WHEN** a `member` calls the audit listing
- **THEN** the API responds 403

#### Scenario: No mutation API
- **WHEN** the codebase is grepped for audit updates/deletes
- **THEN** only test fixtures reference them (gate via code review + `grep` in CI is future work)

