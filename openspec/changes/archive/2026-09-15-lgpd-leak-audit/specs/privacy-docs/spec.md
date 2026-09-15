## ADDED Requirements

### Requirement: Privacy guarantees documented and tested

The project SHALL document its personal-data inventory, purposes, retention and subject rights (`docs/PRIVACY.md` + pt-BR) AND enforce no-secret-in-audit/logs with integration tests on real Postgres.

#### Scenario: Secret-heavy flows leave no secret in audit
- **WHEN** change-password, forgot, reset and force-reset run
- **THEN** no `audit_log.metadata` row and no redacted outbox payload contains a password, token or secret substring.

#### Scenario: Log sender never logs context
- **WHEN** `LogEmailSender.send_template` runs with a token-bearing context
- **THEN** captured logs contain neither the token nor any context value.
