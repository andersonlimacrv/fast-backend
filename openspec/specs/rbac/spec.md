# rbac Specification

## Purpose
TBD - created by archiving change rbac-entitlements. Update Purpose after archive.
## Requirements
### Requirement: Role-gated operations

The system SHALL deny operations requiring a minimum role when the caller's membership role ranks below it.

#### Scenario: Member attempts admin operation
- **WHEN** a `member` calls an endpoint requiring `admin`
- **THEN** the API responds 403

#### Scenario: Admin passes role gate
- **WHEN** an `admin` or `owner` calls the same endpoint
- **THEN** the request proceeds normally

