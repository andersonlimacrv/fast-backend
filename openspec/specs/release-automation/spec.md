# release-automation Specification

## Purpose
TBD - created by archiving change oss-professional. Update Purpose after archive.
## Requirements
### Requirement: Tag-driven releases from the changelog

The system SHALL create a GitHub Release on tag `v*.*.*` with notes extracted from the matching CHANGELOG section, failing when the section is missing.

#### Scenario: Tagged release
- **WHEN** tag `v1.1.0` is pushed with a `## [v1.1.0]` section present
- **THEN** a Release `v1.1.0` appears with those notes verbatim

#### Scenario: Tag without changelog entry
- **WHEN** a tag has no matching section
- **THEN** the workflow fails before creating anything

### Requirement: Extractor unit-tested

The system SHALL cover `scripts/release_notes.py` (section parse, missing section error, unordered file) with unit tests.

#### Scenario: Missing section
- **WHEN** the extractor runs for an absent version
- **THEN** it exits non-zero with a clear message

