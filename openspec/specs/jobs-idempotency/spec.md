# jobs-idempotency Specification

## Purpose
TBD - created by archiving change email-storage-jobs. Update Purpose after archive.
## Requirements
### Requirement: Logical-once enqueue

The system SHALL persist one `outbox_messages` row per `idempotency_key`; re-enqueue returns the existing row without side effects.

#### Scenario: Double enqueue
- **WHEN** the same key is enqueued twice
- **THEN** a single row exists and downstream fires once

### Requirement: Claimed work completes or retries

The system SHALL let one worker claim a message (`processing`), mark it `processed` on success, or requeue with `attempts+1` on failure, parking it `dead` past the limit.

#### Scenario: Transient failure then success
- **WHEN** a task fails once then succeeds
- **THEN** it ends `processed` with `attempts == 1`

#### Scenario: Permanent failure
- **WHEN** a task always fails
- **THEN** it ends `dead` after N attempts and stops being claimed

