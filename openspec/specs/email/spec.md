# email Specification

## Purpose
TBD - created by archiving change email-storage-jobs. Update Purpose after archive.
## Requirements
### Requirement: Templated email via contract

The system SHALL send email through the `EmailSender` contract rendered from Jinja2 templates with `StrictUndefined`.

#### Scenario: Welcome email content
- **WHEN** the welcome template is rendered with a name and link
- **THEN** the HTML contains both, and a missing variable fails instead of sending partial content

### Requirement: SMTP delivery with dev capture

The system SHALL deliver via SMTP in any environment pointing at one, and Mailpit SHALL capture mail in development.

#### Scenario: Mail sent through Mailpit
- **WHEN** `SmtpEmailSender` targets the dev Mailpit
- **THEN** exactly one message lands in the Mailpit inbox (slow, skipped without docker)

