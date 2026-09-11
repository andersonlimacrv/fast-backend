# oss-presence Specification

## Purpose
TBD - created by archiving change oss-professional. Update Purpose after archive.
## Requirements
### Requirement: Professional README and OSS files

The repo SHALL present badges (CI, release, Python, license), TOC, quickstart, and link CONTRIBUTING, SECURITY, issue/PR templates; no stale placeholder docs may remain.

#### Scenario: Visitor onboarding
- **WHEN** someone opens the repo root
- **THEN** badges, setup (<10 min path), structure, and contribution entry points are visible without opening other files

#### Scenario: No false docs
- **WHEN** the tree is grepped for known-stale strings ("nenhum workflow", "cache?", old counts)
- **THEN** nothing matches

