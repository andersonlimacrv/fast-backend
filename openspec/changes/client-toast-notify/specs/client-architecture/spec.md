## MODIFIED Requirements

### Requirement: Layered frontend architecture

The SPA SHALL route transient user feedback through the typed notify facade (`success`/`info`/`warning`/`error`/`confirm`), rendered by a single mounted toaster; form validation errors stay inline (`ErrorBox`).

#### Scenario: Typed toast per event
- **WHEN** a mutation succeeds (create/switch/logout) or a global event fires
- **THEN** a toast of the matching kind appears with icon and title, auto-dismisses, and a confirm toast carries a working action button

#### Scenario: No toast for form errors
- **WHEN** a form submission fails validation
- **THEN** the error renders inline; no toast is emitted
