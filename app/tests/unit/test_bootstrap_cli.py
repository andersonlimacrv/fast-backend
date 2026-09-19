"""Unit tests: root bootstrap CLI gates (no DB — key checks run first)."""

import getpass
from types import SimpleNamespace

import pytest

from app.core.settings import Settings
from scripts.bootstrap_root import amain, bootstrap, parse_args, validate_root_email

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
async def test_mismatched_passwords_return_1_without_db(monkeypatch) -> None:
    responses = iter(["Str0ng!Pass", "Different1!"])
    monkeypatch.setattr(getpass, "getpass", lambda *args, **kwargs: next(responses))
    assert await amain(["--email", "root@example.com", "--key", KEY]) == 1


@pytest.mark.unit
async def test_matching_passwords_pass_the_gate(monkeypatch) -> None:
    monkeypatch.setattr(getpass, "getpass", lambda *args, **kwargs: "Str0ng!Pass")
    monkeypatch.setenv("FRONTEND_URL", "https://app.example.com")
    created: dict[str, str] = {}

    async def fake_bootstrap(*, settings, email, password, key):
        created.update(email=email, password=password, key=key)
        return SimpleNamespace(email=email)

    monkeypatch.setattr("scripts.bootstrap_root.bootstrap", fake_bootstrap)
    assert await amain(["--email", "root@example.com", "--key", KEY]) == 0
    assert created == {"email": "root@example.com", "password": "Str0ng!Pass", "key": KEY}


@pytest.mark.unit
def test_parse_args_flags_and_env(monkeypatch) -> None:
    args = parse_args(["--email", "r@example.com", "--key", KEY])
    assert (args.email, args.key) == ("r@example.com", KEY)
    monkeypatch.setenv("ROOT_EMAIL", "env@example.com")
    monkeypatch.setenv("BOOTSTRAP_KEY", KEY)
    args = parse_args([])
    assert (args.email, args.key) == ("env@example.com", KEY)


@pytest.mark.unit
def test_malformed_root_emails_rejected() -> None:
    for bad in ("andersonlimacrv", "missing-at.com", "a@b", "", "  ", "a @b.com"):
        with pytest.raises(ValueError, match="bootstrap failed"):
            validate_root_email(bad)


@pytest.mark.unit
def test_valid_root_email_passes_gate() -> None:
    validate_root_email("root@example.com")


@pytest.mark.unit
async def test_bootstrap_rejects_malformed_email_before_db() -> None:
    # Correct key, typo email: the format gate fires before any DB I/O,
    # so this stays a DB-free unit test (wrong key would prove nothing here).
    with pytest.raises(ValueError, match="bootstrap failed"):
        await bootstrap(settings=_settings(), email="andersonlimacrv", password="Str0ng!Pass", key=KEY)
