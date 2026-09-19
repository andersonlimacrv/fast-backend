"""Integration tests: root bootstrap against real Postgres (testcontainers).

Covers the paths unit tests cannot: superuser creation, the single-root
refusal, the taken-email refusal, and the audit row. `clean_db` isolates
every test (TRUNCATE … users … CASCADE).
"""

import getpass

import pytest
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import create_async_engine

from app.core.settings import Settings
from app.modules.audit.models import AuditLog
from app.modules.identity.models import User
from scripts.bootstrap_root import GENERIC_FAILURE, amain, bootstrap

KEY = "z" * 32
EMAIL = "root@example.com"
PASSWORD = "Str0ng!Pass"


def _settings(base_settings, **overrides):
    return base_settings.model_copy(update={"bootstrap_key": KEY, **overrides})


async def _count(engine, model, *clauses) -> int:
    async with engine.connect() as conn:
        query = select(func.count()).select_from(model)
        for clause in clauses:
            query = query.where(clause)
        return int((await conn.execute(query)).scalar_one())


@pytest.mark.integration
async def test_success_creates_superuser_staff_and_audit(base_settings, clean_db) -> None:
    settings = _settings(base_settings)
    user = await bootstrap(settings=settings, email=EMAIL, password=PASSWORD, key=KEY)
    assert user.is_superuser is True and user.is_staff is True
    engine = create_async_engine(settings.database_url)
    try:
        assert await _count(engine, User) == 1
        assert await _count(engine, AuditLog, AuditLog.action == "root.bootstrap") == 1
    finally:
        await engine.dispose()


@pytest.mark.integration
async def test_second_bootstrap_refused(base_settings, clean_db) -> None:
    settings = _settings(base_settings)
    await bootstrap(settings=settings, email=EMAIL, password=PASSWORD, key=KEY)
    with pytest.raises(Exception, match="exists"):
        await bootstrap(settings=settings, email="other@example.com", password=PASSWORD, key=KEY)


@pytest.mark.integration
async def test_bootstrap_audit_metadata_success_and_no_second_audit(base_settings, clean_db) -> None:
    settings = _settings(base_settings)
    await bootstrap(settings=settings, email=EMAIL, password=PASSWORD, key=KEY)
    engine = create_async_engine(settings.database_url)
    try:
        assert await _count(engine, AuditLog, AuditLog.action == "root.bootstrap") == 1
        async with engine.connect() as conn:
            meta = (await conn.execute(select(AuditLog.audit_metadata).where(AuditLog.action == "root.bootstrap"))).scalar_one()
            assert meta == {"success": True}
        with pytest.raises(Exception, match="exists"):
            await bootstrap(settings=settings, email="other@example.com", password=PASSWORD, key=KEY)
        assert await _count(engine, AuditLog, AuditLog.action == "root.bootstrap") == 1
    finally:
        await engine.dispose()


def _amain_env(monkeypatch: pytest.MonkeyPatch, containers: dict[str, str]) -> None:
    monkeypatch.setenv("DATABASE_URL", containers["database_url"])
    monkeypatch.setenv("REDIS_URL", containers["redis_url"])
    monkeypatch.setenv("BOOTSTRAP_KEY", KEY)
    monkeypatch.setenv("FRONTEND_URL", "https://app.example.com")
    monkeypatch.setenv("SECRET_KEY", "x" * 32)


@pytest.mark.integration
async def test_amain_stdout_generic_hides_key_vs_exists(monkeypatch, containers, clean_db, capsys) -> None:
    _amain_env(monkeypatch, containers)
    monkeypatch.setattr(getpass, "getpass", lambda *args, **kwargs: PASSWORD)
    assert await amain(["--email", EMAIL, "--key", "0" * 32]) == 1
    wrong_key_out = capsys.readouterr().out.strip()
    assert wrong_key_out == GENERIC_FAILURE

    settings = Settings(
        secret_key="x" * 32,
        database_url=containers["database_url"],
        redis_url=containers["redis_url"],
        frontend_url="https://app.example.com",
        bootstrap_key=KEY,
    )
    await bootstrap(settings=settings, email=EMAIL, password=PASSWORD, key=KEY)
    assert await amain(["--email", "other@example.com", "--key", KEY]) == 1
    exists_out = capsys.readouterr().out.strip()
    assert exists_out == GENERIC_FAILURE
    assert wrong_key_out == exists_out
    for leaked in ("exists", "registered", "key"):
        assert leaked not in exists_out.lower()


@pytest.mark.integration
async def test_amain_short_password_exits_1_without_user(monkeypatch, containers, clean_db, capsys) -> None:
    _amain_env(monkeypatch, containers)
    monkeypatch.setattr(getpass, "getpass", lambda *args, **kwargs: "short")
    assert await amain(["--email", EMAIL, "--key", KEY]) == 1
    assert capsys.readouterr().out.strip() == GENERIC_FAILURE
    engine = create_async_engine(containers["database_url"])
    try:
        assert await _count(engine, User) == 0
        assert await _count(engine, AuditLog, AuditLog.action == "root.bootstrap") == 0
    finally:
        await engine.dispose()


@pytest.mark.integration
async def test_malformed_email_creates_nothing(base_settings, clean_db) -> None:
    settings = _settings(base_settings)
    with pytest.raises(Exception, match="bootstrap failed"):
        await bootstrap(settings=settings, email="andersonlimacrv", password=PASSWORD, key=KEY)
    engine = create_async_engine(settings.database_url)
    try:
        assert await _count(engine, User) == 0
        assert await _count(engine, AuditLog, AuditLog.action == "root.bootstrap") == 0
    finally:
        await engine.dispose()


@pytest.mark.integration
async def test_amain_mismatched_passwords_create_nothing(monkeypatch, containers, clean_db, capsys) -> None:
    _amain_env(monkeypatch, containers)
    responses = iter([PASSWORD, "Different1!"])
    monkeypatch.setattr(getpass, "getpass", lambda *args, **kwargs: next(responses))
    assert await amain(["--email", EMAIL, "--key", KEY]) == 1
    assert capsys.readouterr().out.strip() == GENERIC_FAILURE
    engine = create_async_engine(containers["database_url"])
    try:
        assert await _count(engine, User) == 0
        assert await _count(engine, AuditLog, AuditLog.action == "root.bootstrap") == 0
    finally:
        await engine.dispose()


@pytest.mark.integration
async def test_taken_email_refused(base_settings, clean_db, client) -> None:
    reg = await client.post("/auth/register", json={"email": EMAIL, "password": PASSWORD})
    assert reg.status_code == 201, reg.text
    settings = base_settings.model_copy(update={"bootstrap_key": KEY})
    with pytest.raises(Exception, match="already registered"):
        await bootstrap(settings=settings, email=EMAIL, password=PASSWORD, key=KEY)


@pytest.mark.integration
async def test_amain_end_to_end(monkeypatch, containers, clean_db) -> None:
    monkeypatch.setenv("DATABASE_URL", containers["database_url"])
    monkeypatch.setenv("REDIS_URL", containers["redis_url"])
    monkeypatch.setenv("BOOTSTRAP_KEY", KEY)
    monkeypatch.setenv("FRONTEND_URL", "https://app.example.com")
    monkeypatch.setenv("SECRET_KEY", "x" * 32)
    monkeypatch.setattr(getpass, "getpass", lambda *args, **kwargs: PASSWORD)
    assert await amain(["--email", EMAIL, "--key", KEY]) == 0
