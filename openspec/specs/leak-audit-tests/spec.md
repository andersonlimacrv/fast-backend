# leak-audit-tests Specification

## Purpose
Secret-leak auditing as tests (change `lgpd-leak-audit`): no password, token or secret may reach audit metadata, leftover outbox payloads or logs.

## Requirements
### Requirement: Secret-heavy flows leave no secret in audit

The system SHALL keep passwords, tokens and secrets out of `audit_log.metadata` and out of dispatched outbox payloads.

#### Scenario: Flows run clean
- **WHEN** change-password, forgot, reset and force-reset run
- **THEN** no `audit_log.metadata` row and no redacted outbox payload contains a password, token or secret substring.

### Requirement: Log sender never logs context

The system SHALL never write email template context (links, tokens) to logs via `LogEmailSender.send_template`.

#### Scenario: Token-bearing context stays out of logs
- **WHEN** `LogEmailSender.send_template` runs with a token-bearing context
- **THEN** captured logs contain neither the token nor any context value.
