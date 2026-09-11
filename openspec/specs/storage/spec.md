# storage Specification

## Purpose
TBD - created by archiving change email-storage-jobs. Update Purpose after archive.
## Requirements
### Requirement: Local storage works with zero infra

The system SHALL persist, retrieve, check, delete and presign (explicit local strategy) objects through `LocalFilesystemStorage` without any external service.

#### Scenario: Local roundtrip
- **WHEN** bytes are put, fetched, checked, then deleted
- **THEN** each operation behaves correctly and `exists` flips accordingly

### Requirement: S3-compatible backend behind the same contract

The system SHALL offer `S3CompatibleStorage` (MinIO/S3/R2 via `endpoint_url`) implementing `ObjectStorage`.

#### Scenario: MinIO roundtrip
- **WHEN** pointed at a MinIO container
- **THEN** put/get/delete roundtrip works (slow, skipped without docker)

### Requirement: Modules never touch providers

The system SHALL resolve storage only through `ObjectStorage`; direct `aioboto3`/filesystem imports in modules fail the architecture gate.

#### Scenario: Forbidden provider import
- **WHEN** a module imports the S3 SDK directly
- **THEN** `lint-imports` fails

