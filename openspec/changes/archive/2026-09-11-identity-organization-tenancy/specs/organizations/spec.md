## ADDED Requirements

### Requirement: Organizations with owner on creation

The system SHALL create organizations with the creator as `owner`, a unique slug, and list them per user.

#### Scenario: Create organization
- **WHEN** an authenticated user posts a valid name to `/organizations`
- **THEN** the org is created with a unique slug and the creator holds the `owner` role

### Requirement: Membership management with fixed roles

The system SHALL manage memberships with fixed roles `owner|admin|member`; only `owner|admin` may add members or change roles, and the last owner cannot be removed or demoted.

#### Scenario: Non-admin cannot add members
- **WHEN** a `member` tries to add someone to the org
- **THEN** the API responds 403

#### Scenario: Last owner protected
- **WHEN** the only owner is removed or demoted
- **THEN** the operation is rejected with 409

### Requirement: Organization API is the cross-module surface

The system SHALL expose membership reads only via `modules/organization/public.py` (`get_membership`, `assert_membership`, `list_user_orgs`).

#### Scenario: Tenancy resolves through public API
- **WHEN** `CurrentTenant` needs the caller's membership
- **THEN** it calls `public.assert_membership`, importing nothing else from the module
