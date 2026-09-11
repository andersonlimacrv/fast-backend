## ADDED Requirements

### Requirement: One-command second project

The system SHALL generate a working project tree from this repo via `scripts/new_project.py`, excluding VCS, venvs, caches and archives, with the package renamed.

#### Scenario: Bootstrap
- **WHEN** the script runs with a new name into an empty dir
- **THEN** the output has `app/`, renamed `pyproject.toml`, no `.git`/`.venv`/`__pycache__`, and passes `ruff check`
