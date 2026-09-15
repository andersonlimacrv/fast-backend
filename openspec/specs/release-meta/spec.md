# release-meta Specification

## Purpose
TBD - created by archiving change backend-release-meta. Update Purpose after archive.
## Requirements
### Requirement: Public release metadata

The system SHALL expose unauthenticated `GET /meta` returning exactly `{app, version, modules:[{key, enabled}]}` where `version` equals `APP_VERSION` and `admin`/`billing` reflect their flags; the body SHALL contain no secrets, hosts, PII, or dependency status.

#### Scenario: Anonymous fetch
- **WHEN** `GET /meta` without token
- **THEN** 200 with the exact shape AND no forbidden substrings in the serialized body.

#### Scenario: Flags reflected
- **WHEN** `ADMIN_ENABLED=false`
- **THEN** `modules` contains `{key: "admin", enabled: false}`.

