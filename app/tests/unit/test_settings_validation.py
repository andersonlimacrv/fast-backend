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
        Settings(secret_key="x" * 32, bootstrap_key="short")


@pytest.mark.unit
def test_reset_ttl_bounds() -> None:
    with pytest.raises(ValidationError):
        Settings(secret_key="x" * 32, password_reset_ttl_minutes=2)
    assert Settings(secret_key="x" * 32).password_reset_ttl_minutes == 60


@pytest.mark.unit
def test_unknown_tenancy_rejected() -> None:
    with pytest.raises(ValidationError):
        Settings(secret_key="x" * 32, tenancy_mode="schema")


@pytest.mark.unit
def test_csv_lists_accepted() -> None:
    s = Settings(secret_key="x" * 32, cors_origins="https://a.example,https://b.example")  # type: ignore[arg-type]
    assert s.cors_origins == ["https://a.example", "https://b.example"]
