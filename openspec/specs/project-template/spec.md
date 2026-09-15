# project-template Specification

## Purpose
TBD - created by archiving change release-template. Update Purpose after archive.
## Requirements
### Requirement: One-command second project

The system SHALL generate a working project tree from this repo via `scripts/new_project.py`, excluding VCS, venvs, caches and archives, with the package renamed.

#### Scenario: Bootstrap
- **WHEN** the script runs with a new name into an empty dir
- **THEN** the output has `app/`, renamed `pyproject.toml`, no `.git`/`.venv`/`__pycache__`, and passes `ruff check`

#### Scenario: Make-first bootstrap doc
- **WHEN** a user follows the README "New project from here" section
- **THEN** they run `make new-project name=<kebab> dest=<dir>` first (canonical; `python scripts/new_project.py` only as documented fallback) and get the same validated tree

#### Scenario: Bilingual parity
- **WHEN** `README.md` changes
- **THEN** `README.pt-BR.md` carries the same sections, same commands, and links `docs/Makefile.pt-BR.md`, preserving the EN/PT-BR toggle banners

