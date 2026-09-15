## MODIFIED Requirements

### Requirement: One-command second project

The system SHALL document `make new-project name=<kebab> dest=<dir>` as the canonical bootstrap in `README.md` (EN), with `python scripts/new_project.py --name ... --dest ...` retained only as documented fallback, both producing the same validated tree (excludes VCS/venvs/caches, renames package).

#### Scenario: Make-first bootstrap doc
- **WHEN** a user follows the README "New project from here" section
- **THEN** they run `make new-project` first and get a working tree with `app/`, renamed `pyproject.toml`, no `.git`/`.venv`/`__pycache__`

#### Scenario: Bilingual parity
- **WHEN** `README.md` changes
- **THEN** `README.pt-BR.md` carries the same sections, same commands, and links `docs/Makefile.pt-BR.md`, preserving the EN/PT-BR toggle banners
