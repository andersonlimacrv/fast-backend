"""Unit tests: settings validation (no external services)."""

import pytest
from pydantic import ValidationError

from app.core.settings import Settings


@pytest.mark.unit
def test_local_defaults_boot() -> None:
    assert Settings(secret_key="x" * 32).environment == "local"


@pytest.mark.unit
def test_production_rejects_default_secret() -> None:
    with pytest.raises(ValidationError):
        Settings(environment="production", trusted_hosts=["example.com"])


@pytest.mark.unit
def test_production_rejects_short_secret() -> None:
    with pytest.raises(ValidationError):
        Settings(environment="production", secret_key="short", trusted_hosts=["example.com"])


@pytest.mark.unit
def test_production_rejects_wildcard_hosts() -> None:
    with pytest.raises(ValidationError):
        Settings(environment="production", secret_key="x" * 32)


@pytest.mark.unit
def test_production_valid_boots() -> None:
    s = Settings(environment="production", secret_key="x" * 32, trusted_hosts=["example.com"])
    assert s.trusted_hosts == ["example.com"]


@pytest.mark.unit
def test_unknown_tenancy_rejected() -> None:
    with pytest.raises(ValidationError):
        Settings(secret_key="x" * 32, tenancy_mode="schema")


@pytest.mark.unit
def test_csv_lists_accepted() -> None:
    s = Settings(secret_key="x" * 32, cors_origins="https://a.example,https://b.example")  # type: ignore[arg-type]
    assert s.cors_origins == ["https://a.example", "https://b.example"]
