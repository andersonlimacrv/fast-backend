"""Unit tests: settings validation (no external services)."""

import pytest
from pydantic import ValidationError

from app.core.settings import Settings


@pytest.mark.unit
def test_local_defaults_boot() -> None:
    s = Settings(secret_key="x" * 32, frontend_url="http://localhost:5173")
    assert s.environment == "local"


@pytest.mark.unit
def test_empty_frontend_url_rejected() -> None:
    with pytest.raises(ValidationError, match="FRONTEND_URL must be set"):
        Settings(secret_key="x" * 32, frontend_url="")


@pytest.mark.unit
def test_production_rejects_default_secret(tmp_path, monkeypatch) -> None:
    # Settings reads `.env` from cwd: isolate from any developer `.env` so the
    # dev-default secret (not a local real one) is what gets validated.
    monkeypatch.chdir(tmp_path)
    with pytest.raises(ValidationError):
        Settings(environment="production", trusted_hosts=["example.com"], frontend_url="https://app.example.com")


@pytest.mark.unit
def test_production_rejects_short_secret() -> None:
    with pytest.raises(ValidationError):
        Settings(
            environment="production", secret_key="short", trusted_hosts=["example.com"], frontend_url="https://app.example.com"
        )


@pytest.mark.unit
def test_production_rejects_wildcard_hosts(tmp_path, monkeypatch) -> None:
    # Isolate from any developer `.env` (a real TRUSTED_HOSTS there would mask this).
    monkeypatch.chdir(tmp_path)
    with pytest.raises(ValidationError):
        Settings(environment="production", secret_key="x" * 32, frontend_url="https://app.example.com")


@pytest.mark.unit
def test_production_valid_boots() -> None:
    s = Settings(
        environment="production",
        secret_key="x" * 32,
        trusted_hosts=["example.com"],
        bootstrap_key="y" * 32,
        frontend_url="https://app.example.com",
    )
    assert s.trusted_hosts == ["example.com"]


@pytest.mark.unit
def test_production_rejects_missing_bootstrap_key(tmp_path, monkeypatch) -> None:
    # Isolate from any developer `.env` (a real BOOTSTRAP_KEY there would mask this).
    monkeypatch.chdir(tmp_path)
    with pytest.raises(ValidationError):
        Settings(
            environment="production",
            secret_key="x" * 32,
            trusted_hosts=["example.com"],
            frontend_url="https://app.example.com",
        )


@pytest.mark.unit
def test_production_rejects_http_frontend_url() -> None:
    with pytest.raises(ValidationError):
        Settings(
            environment="production",
            secret_key="x" * 32,
            trusted_hosts=["example.com"],
            bootstrap_key="y" * 32,
            frontend_url="http://app.example.com",
        )


@pytest.mark.unit
def test_short_bootstrap_key_rejected() -> None:
    with pytest.raises(ValidationError):
        Settings(secret_key="x" * 32, bootstrap_key="short", frontend_url="https://app.example.com")


@pytest.mark.unit
def test_reset_ttl_bounds() -> None:
    with pytest.raises(ValidationError):
        Settings(secret_key="x" * 32, password_reset_ttl_minutes=2, frontend_url="https://app.example.com")
    assert Settings(secret_key="x" * 32, frontend_url="https://app.example.com").password_reset_ttl_minutes == 60


@pytest.mark.unit
def test_unknown_tenancy_rejected() -> None:
    with pytest.raises(ValidationError):
        Settings(secret_key="x" * 32, tenancy_mode="schema", frontend_url="https://app.example.com")


@pytest.mark.unit
def test_social_login_defaults_off() -> None:
    s = Settings(secret_key="x" * 32, frontend_url="https://app.example.com")
    assert s.social_login_enabled is False


@pytest.mark.unit
def test_social_login_requires_oidc_configuration() -> None:
    with pytest.raises(ValidationError, match="OIDC_ISSUER"):
        Settings(secret_key="x" * 32, frontend_url="https://app.example.com", social_login_enabled=True)


@pytest.mark.unit
def test_social_state_and_exchange_ttl_bounds() -> None:
    with pytest.raises(ValidationError):
        Settings(secret_key="x" * 32, frontend_url="https://app.example.com", oidc_state_ttl_seconds=10)
    with pytest.raises(ValidationError):
        Settings(secret_key="x" * 32, frontend_url="https://app.example.com", oidc_exchange_ttl_seconds=10)


@pytest.mark.unit
def test_production_social_login_requires_https() -> None:
    with pytest.raises(ValidationError, match="HTTPS OIDC_ISSUER"):
        Settings(
            environment="production",
            secret_key="x" * 32,
            trusted_hosts=["example.com"],
            bootstrap_key="y" * 32,
            frontend_url="https://app.example.com",
            social_login_enabled=True,
            oidc_issuer="http://idp.example.com",
            oidc_client_id="client",
            oidc_client_secret="secret",
            oidc_redirect_uri="https://api.example.com/auth/social/oidc/callback",
        )


@pytest.mark.unit
def test_proxy_hops_default_fail_closed() -> None:
    s = Settings(secret_key="x" * 32, frontend_url="http://localhost:5173")
    assert s.trusted_proxy_hops == 0


@pytest.mark.unit
def test_negative_proxy_hops_rejected() -> None:
    with pytest.raises(ValidationError, match="TRUSTED_PROXY_HOPS"):
        Settings(secret_key="x" * 32, frontend_url="https://app.example.com", trusted_proxy_hops=-1)


@pytest.mark.unit
def test_production_rejects_wildcard_cors_with_credentials() -> None:
    with pytest.raises(ValidationError, match="CORS_ORIGINS"):
        Settings(
            environment="production",
            secret_key="x" * 32,
            trusted_hosts=["example.com"],
            bootstrap_key="y" * 32,
            frontend_url="https://app.example.com",
            cors_origins=["*"],
        )


@pytest.mark.unit
def test_rate_limit_defaults() -> None:
    s = Settings(secret_key="x" * 32, frontend_url="http://localhost:5173")
    assert (s.register_max_attempts, s.register_window_seconds) == (10, 3600)
    assert (s.rate_limit_global_max_attempts, s.rate_limit_global_window_seconds) == (300, 60)


@pytest.mark.unit
def test_rate_limit_bounds() -> None:
    with pytest.raises(ValidationError):
        Settings(secret_key="x" * 32, frontend_url="https://app.example.com", register_max_attempts=0)
    with pytest.raises(ValidationError):
        Settings(secret_key="x" * 32, frontend_url="https://app.example.com", register_window_seconds=0)
    with pytest.raises(ValidationError):
        Settings(secret_key="x" * 32, frontend_url="https://app.example.com", rate_limit_global_max_attempts=0)
    with pytest.raises(ValidationError):
        Settings(secret_key="x" * 32, frontend_url="https://app.example.com", rate_limit_global_window_seconds=0)


@pytest.mark.unit
def test_csv_lists_accepted() -> None:
    s = Settings(
        secret_key="x" * 32,
        cors_origins="https://a.example,https://b.example",  # type: ignore[arg-type]
        frontend_url="https://app.example.com",
    )
    assert s.cors_origins == ["https://a.example", "https://b.example"]
