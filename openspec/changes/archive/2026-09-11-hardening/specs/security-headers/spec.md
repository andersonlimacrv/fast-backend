## ADDED Requirements

### Requirement: Security headers on every response

The system SHALL set `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, and `Referrer-Policy: same-origin` on every HTTP response, plus `Strict-Transport-Security` only over HTTPS/production.

#### Scenario: Headers present
- **WHEN** any request is made to the API
- **THEN** the response includes the three base headers, and HSTS appears only on secure contexts

### Requirement: Trusted hosts per environment

The system SHALL reject requests whose `Host` is not in the environment's allowlist.

#### Scenario: Unknown host blocked
- **WHEN** a request arrives with an unlisted `Host` in staging/production
- **THEN** the API responds 400 before reaching domain logic

### Requirement: Explicit CORS allowlist

The system SHALL allow cross-origin requests only from configured origins; staging/production default to none.

#### Scenario: Disallowed origin blocked
- **WHEN** a browser request carries an `Origin` outside the allowlist
- **THEN** no `Access-Control-Allow-Origin` is returned for it
