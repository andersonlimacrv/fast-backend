# billing Specification

## Purpose
TBD - created by archiving change billing-stripe. Update Purpose after archive.
## Requirements
### Requirement: Verified Stripe webhooks only

The system SHALL accept webhook deliveries only with a valid `Stripe-Signature` within tolerance; otherwise 400 with nothing marked processed.

#### Scenario: Forged delivery
- **WHEN** a payload arrives with a bad signature
- **THEN** the API responds 400 and no outbox row becomes processed

### Requirement: Duplicate deliveries apply once

The system SHALL record each `event_id` once in the outbox and apply its business effect exactly once across redeliveries.

#### Scenario: Triple delivery
- **WHEN** the same `evt_123` is delivered three times
- **THEN** all respond 200, one outbox row exists processed, and the grant reflects a single application

### Requirement: Subscription lifecycle maps to grants

The system SHALL upsert the mapped grant on `checkout.session.completed` / `subscription.created|updated`, and disable it on `subscription.deleted`.

#### Scenario: Cancellation
- **WHEN** a `customer.subscription.deleted` arrives for a mapped price
- **THEN** the grant row ends with `enabled=false`

### Requirement: Billing is optional

The system SHALL serve the full core API with `BILLING_ENABLED=false` (route absent, 404) and all pre-billing tests green.

#### Scenario: Flag off
- **WHEN** the app boots with defaults
- **THEN** `POST /billing/webhooks/stripe` returns 404

