## 1. Settings + endpoint

- [x] 1.1 `settings.py`: `app_version="0.1.0"` + validação não-vazia + unit em `test_settings_validation.py`
- [x] 1.2 `app/interfaces/meta.py`: `GET /meta` (schemas inline, lista núcleo + flags) + registro em `main.py`
- [x] 1.3 `.env.example`: `APP_VERSION` comentado (injetado da tag no release)

## 2. Testes (TDD)

- [x] 2.1 `app/tests/unit/test_meta.py`: shape exato; flags refletem settings (parametrizar admin/billing on/off); **anti-vazamento** (varredura de substrings proibidas no body serializado)
- [x] 2.2 Sem auth exigido (401 nunca; 200 anônimo)

## 3. Docs + gates

- [x] 3.1 ADR `0008-public-release-meta.md` (PT-BR) + spec `release-meta` (delta) + CHANGELOG
- [x] 3.2 `ruff + mypy + lint-imports` verdes; `pytest -m unit`; `bandit -ll` zero Medium+; `pip-audit`; `gitleaks`
- [x] 3.3 `openspec verify` 3 dimensões antes de `archive`
