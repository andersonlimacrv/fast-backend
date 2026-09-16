## MODIFIED Requirements

### Requirement: Tag-driven releases from the changelog

The system SHALL create a GitHub Release on tag `v*.*.*` with notes extracted from the matching CHANGELOG section, failing when the section is missing, AND every merged PR to `main` SHALL automatically finalize `[Unreleased]` into a new patch version (bump + tag + push), so nothing stays Unreleased.

#### Scenario: Tagged release
- **WHEN** tag `v1.1.0` is pushed with a `## [v1.1.0]` section present
- **THEN** a Release `v1.1.0` appears with those notes verbatim

#### Scenario: Tag without changelog entry
- **WHEN** a tag has no matching section
- **THEN** the workflow fails before creating anything

#### Scenario: PR merged with Unreleased entries
- **WHEN** a PR with `[Unreleased]` content merges to `main`
- **THEN** a new patch tag is pushed and a Release is created from the finalized section, leaving an empty `[Unreleased]` stub.
