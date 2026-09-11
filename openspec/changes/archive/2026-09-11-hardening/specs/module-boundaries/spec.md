## ADDED Requirements

### Requirement: Layered architecture is machine-enforced

The system SHALL enforce via `import-linter` that imports flow `interfaces → modules → core/contracts → infrastructure`, that core modules respect the DAG `identity → organization → tenancy → entitlements`, and that no module imports another module's `models`, `repository`, `service` or `dependencies`.

#### Scenario: Forbidden import fails the gate
- **WHEN** a module imports internals of another module
- **THEN** `lint-imports` exits non-zero identifying the violated contract

### Requirement: Optionals stay leaves

The system SHALL forbid any `CORE_MODULES` member from importing `OPTIONAL_MODULES` members.

#### Scenario: Core depends on optional
- **WHEN** `modules.identity` imports anything from `billing_stripe`
- **THEN** `lint-imports` fails
