# recovery Specification

## Purpose
Recovery de senha como parte da identidade (change B-password-recovery, ADR 0006): token opaco single-use com o mesmo rigor do refresh, anti-enumeração, throttling, entrega via outbox, testável com Mailpit.

## Requirements
### Requirement: Forgot genérico com throttling

The system SHALL respond `202` identically for existing or unknown emails; SHALL create a reset + outbox row only when an active user exists; bursts SHALL return 429 without leaking existence.

#### Scenario: Enumeração neutra
- **WHEN** `POST /forgot` with an unknown email
- **THEN** 202 AND no row in `password_resets` AND no email.

### Requirement: Reset como boundary event single-use

The system SHALL accept a valid token exactly once (`used_at` + `FOR UPDATE`); success SHALL rotate the hash, set `tokens_valid_after=now`, revoke the refresh family and invalidate sibling pendings; reuse/expired SHALL return generic 400.

#### Scenario: Reuse negado
- **WHEN** `POST /reset` with an already-used token
- **THEN** 400 AND the user's sessions stay in the post-first-reset state.

### Requirement: Force-reset administrativo sem segredo

`POST /admin/users/{id}/force-password-reset` (staff+, `reason`) SHALL revoke sessions, generate recovery and return `{status:accepted}` without including any token/link.

#### Scenario: Member tenta force-reset
- **WHEN** a member calls force-reset
- **THEN** 403 AND no session is revoked.
