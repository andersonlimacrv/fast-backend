# two-step-login Specification

## Purpose
TBD - created by archiving change two-step-login. Update Purpose after archive.
## Requirements
### Requirement: Email-first login without oracle

The client SHALL collect email first (format-validated, normalized) and ALWAYS advance to the password step for any valid email; only a real attempt may fail, with the existing generic 401. The backend SHALL spend equivalent Argon2 cost for unknown emails (discarded dummy verify), keeping status, body and cost indistinguishable.

#### Scenario: Unknown email flow
- **WHEN** any syntactically valid email is submitted (registered or not)
- **THEN** the password step shows AND a subsequent failure renders the same generic 401.

#### Scenario: No timing shortcut
- **WHEN** login runs for an unknown email
- **THEN** the hasher `verify` executes (proven by test double) before the generic error.

