# leak-audit-tests Specification

## Purpose
Secret-leak auditing as tests (change `lgpd-leak-audit`): no password, token or secret may reach audit metadata, leftover outbox payloads or logs.

## Requirements
### Requirement: Secret-heavy flows leave no secret in audit

- **WHEN** change-password, forgot, reset and force-reset run
- **THEN** no `audit_log.metadata` row and no redacted outbox payload contains a password, token or secret substring.

### Requirement: Log sender never logs context

- **WHEN** `LogEmailSender.send_template` runs with a token-bearing context
- **THEN** captured logs contain neither the token nor any context value.
