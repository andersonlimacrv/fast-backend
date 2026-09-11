# tenancy Specification

## Purpose
TBD - created by archiving change identity-organization-tenancy. Update Purpose after archive.
## Requirements
### Requirement: Tenant context from membership, not from the claim alone

The system SHALL resolve `CurrentTenant` by validating the JWT's `active_org_id` against Postgres membership; missing membership denies access even with a valid token.

#### Scenario: Valid token without membership
- **WHEN** a request carries a valid access token with `active_org_id` of an org the user does not belong to
- **THEN** the API responds 403

### Requirement: Tenant-scoped reads cannot forget the filter

The system SHALL require `tenant_id` at `TenantScopedRepository` construction; no default read method may query without it.

#### Scenario: Repository without tenant
- **WHEN** code instantiates the repository without a tenant
- **THEN** construction fails instead of querying unfiltered

### Requirement: Cross-tenant access is explicit

The system SHALL allow bypassing tenant scope only through an explicit `SuperuserContext`.

#### Scenario: Admin support lookup
- **WHEN** internal tooling reads another tenant's row via `SuperuserContext`
- **THEN** the bypass is visible at the call site and auditable

### Requirement: Single mode resolves automatically

The system SHALL resolve the tenant automatically when `TENANCY_MODE=single` without requiring `active_org_id`.

#### Scenario: Single-tenant request
- **WHEN** the app runs in single mode
- **THEN** tenant-scoped operations work without an organization context in the token

