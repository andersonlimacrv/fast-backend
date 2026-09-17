"""Unit tests: root bootstrap CLI gates (no DB — key checks run first)."""

import getpass

import pytest

from app.core.settings import Settings
from scripts.bootstrap_root import amain, bootstrap, parse_args

KEY = "z" * 32


def _settings(bootstrap_key: str = KEY) -> Settings:
    return Settings(
        secret_key="x" * 32,
        frontend_url="https://app.example.com",
        bootstrap_key=bootstrap_key,
    )


@pytest.mark.unit
async def test_wrong_key_rejected_without_touching_db() -> None:
    with pytest.raises(ValueError, match="bootstrap failed"):
        await bootstrap(settings=_settings(), email="root@example.com", password="Str0ng!Pass", key="0" * 32)


@pytest.mark.unit
async def test_empty_keys_rejected() -> None:
    with pytest.raises(ValueError, match="bootstrap failed"):
        await bootstrap(settings=_settings(), email="root@example.com", password="Str0ng!Pass", key="")
    with pytest.raises(ValueError, match="bootstrap failed"):
        await bootstrap(settings=_settings(bootstrap_key=""), email="root@example.com", password="Str0ng!Pass", key=KEY)


@pytest.mark.unit
async def test_empty_email_returns_1_without_password_prompt(monkeypatch) -> None:
    monkeypatch.setattr(getpass, "getpass", lambda *args, **kwargs: (_ for _ in ()).throw(AssertionError("no prompt")))
    assert await amain(["--email", ""]) == 1


@pytest.mark.unit
async def test_short_password_returns_1(monkeypatch) -> None:
    monkeypatch.setattr(getpass, "getpass", lambda *args, **kwargs: "short")
    assert await amain(["--email", "root@example.com"]) == 1


@pytest.mark.unit
def test_parse_args_flags_and_env(monkeypatch) -> None:
    args = parse_args(["--email", "r@example.com", "--key", KEY])
    assert (args.email, args.key) == ("r@example.com", KEY)
    monkeypatch.setenv("ROOT_EMAIL", "env@example.com")
    monkeypatch.setenv("BOOTSTRAP_KEY", KEY)
    args = parse_args([])
    assert (args.email, args.key) == ("env@example.com", KEY)
