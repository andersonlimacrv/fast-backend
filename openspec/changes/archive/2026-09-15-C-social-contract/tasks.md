## 1. Contrato + model + migração

- [x] 1.1 `app/core/contracts/social.py` (`SocialProvider` Protocol) + `app/infrastructure/auth/social.py` (`LinkedIdentity`) + migração `0008_social_identities` + conftest (import + TRUNCATE)
- [x] 1.2 `settings.py`: `social_login_enabled=false` + `.env.example` + unit test de default off

## 2. Docs + gates

- [x] 2.1 ADR 0007 (proposto) + registry triagem `oauth-oidc` (`avaliada`) + CHANGELOG
- [x] 2.2 `ruff+mypy+lint-imports+pytest` + `bandit/pip-audit/gitleaks` + `openspec verify`
