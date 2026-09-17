"""Integration tests: root bootstrap against real Postgres (testcontainers).

Covers the paths unit tests cannot: superuser creation, the single-root
refusal, the taken-email refusal, and the audit row. `clean_db` isolates
every test (TRUNCATE … users … CASCADE).
"""

import getpass

import pytest
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import create_async_engine

from app.modules.audit.models import AuditLog
from app.modules.identity.models import User
from scripts.bootstrap_root import amain, bootstrap

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
