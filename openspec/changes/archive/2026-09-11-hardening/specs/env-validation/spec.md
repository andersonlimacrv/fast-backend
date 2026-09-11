## ADDED Requirements

### Requirement: Insecure production config fails fast

The system SHALL refuse to boot with `ENVIRONMENT=production` when `SECRET_KEY` is the dev default or `TENANCY_MODE` is unknown.

#### Scenario: Default secret in production
- **WHEN** the app boots with production environment and the default secret
- **THEN** startup raises a validation error before serving any request

### Requirement: Local stays frictionless

The system SHALL boot with defaults in `local` without extra setup.

#### Scenario: Fresh clone boots
- **WHEN** the app boots with default settings
- **THEN** it starts normally (warnings allowed, errors not)
