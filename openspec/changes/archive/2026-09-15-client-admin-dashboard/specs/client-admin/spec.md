## ADDED Requirements

### Requirement: Admin dashboard consome o control plane

The client SHALL offer staff-gated pages that operate `GET|POST /admin/*` with a mandatory auditable reason per mutation and confirmation for sensitive actions, without ever displaying reset tokens/links.

#### Scenario: Root opera users pela UI
- **WHEN** root creates a user with a valid reason, disables them, then re-enables them via `/admin/users`
- **THEN** each mutation succeeds with a toast AND the audit trail shows `reason` AND no secret ever appears on screen.

#### Scenario: Member encontra 403 esperado
- **WHEN** a non-staff user opens any `/admin*` route
- **THEN** the UI shows the backend 403 as an `ErrorBox` (never a blank page) AND the Admin nav stays hidden.
