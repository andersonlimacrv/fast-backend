# release-automation Specification

## Purpose
TBD - created by archiving change oss-professional. Update Purpose after archive.
## Requirements
### Requirement: Tag-driven releases from the changelog

The system SHALL create a GitHub Release on tag `v*.*.*` with notes extracted from the matching CHANGELOG section, failing when the section is missing, AND every merged PR to `main` with releasable content SHALL automatically finalize `[Unreleased]` into a new patch version (bump + tag + push). PRs touching behavior without a changelog entry SHALL fail a read-only check; merges with nothing releasable SHALL log `nothing to release` and push no tag.

#### Scenario: Tagged release
- **WHEN** tag `v1.1.0` is pushed with a `## [v1.1.0]` section present
- **THEN** a Release `v1.1.0` appears with those notes verbatim

#### Scenario: Tag without changelog entry
- **WHEN** a tag has no matching section
- **THEN** the workflow fails before creating anything

#### Scenario: PR merged with Unreleased entries
- **WHEN** a PR with `[Unreleased]` content merges to `main`
- **THEN** a new patch tag is pushed and a Release is created from the finalized section, leaving an empty `[Unreleased]` stub.

#### Scenario: Behavior PR without changelog entry
- **WHEN** a PR touches `app/**` (or other non-exempt paths) without adding an `[Unreleased]` entry
- **THEN** the release check fails with an actionable message before merge.

#### Scenario: Silent merge
- **WHEN** a merge carries no Unreleased content and doesn't touch `CHANGELOG.md`
- **THEN** the workflow logs `nothing to release`, pushes no tag, and exits 0.

### Requirement: Extractor unit-tested

The system SHALL cover `scripts/release_notes.py` (section parse, missing section error, unordered file) with unit tests.

#### Scenario: Missing section
- **WHEN** the extractor runs for an absent version
- **THEN** it exits non-zero with a clear message

