"""Shared fixtures: real Postgres + Redis via testcontainers (session), app/client (function)."""

import os
import uuid
from collections.abc import AsyncIterator, Iterator
from typing import Any

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine
from testcontainers.postgres import PostgresContainer
from testcontainers.redis import RedisContainer

# Import models so metadata covers all tables.
import app.infrastructure.auth.refresh_tokens  # noqa: F401
import app.modules.identity.models  # noqa: F401
import app.modules.organization.models  # noqa: F401
import app.modules.projects.models  # noqa: F401
from app.core.settings import Settings
from app.infrastructure.db.base import Base
from app.main import create_app

# Sandboxes without veth networking cannot use bridge mode:
# run pytest with FB_TEST_NETWORK=host (fixed localhost ports, Ryuk disabled).
# Read lazily by testcontainers at container start, so setting it here (after
# imports) is sufficient.
HOST_NET = os.environ.get("FB_TEST_NETWORK") == "host"
if HOST_NET:
    os.environ["TESTCONTAINERS_RYUK_DISABLED"] = "true"


@pytest.fixture(scope="session")
def containers() -> Iterator[dict[str, str]]:
    if HOST_NET:
        import asyncio
        import subprocess

        def run(*args: str) -> None:
            subprocess.run(["docker", *args], check=True, capture_output=True)

        run("pull", "postgres:16-alpine")
        run("pull", "redis:7-alpine")
        run(
            "run",
            "-d",
            "--rm",
            "--network",
            "host",
            "--name",
            "fb-test-pg",
            "-e",
            "POSTGRES_USER=test",
            "-e",
            "POSTGRES_PASSWORD=test",
            "-e",
            "POSTGRES_DB=test",
            "postgres:16-alpine",
        )
        run("run", "-d", "--rm", "--network", "host", "--name", "fb-test-redis", "redis:7-alpine")
        try:

            async def wait_ready() -> None:
                import asyncpg
                import redis.asyncio as aioredis

                for _ in range(120):
                    try:
                        conn = await asyncpg.connect("postgresql://test:test@localhost:5432/test", timeout=2)
                        await conn.close()
                        r = aioredis.from_url("redis://localhost:6379/0")
                        await r.ping()
                        await r.aclose()
                        return
                    except Exception:
                        await asyncio.sleep(1)
                raise RuntimeError("test containers not ready")

            asyncio.run(wait_ready())
            yield {
                "database_url": "postgresql+asyncpg://test:test@localhost:5432/test",
                "redis_url": "redis://localhost:6379/0",
            }
        finally:
            run("rm", "-f", "fb-test-pg")
            run("rm", "-f", "fb-test-redis")
        return
    pg = PostgresContainer("postgres:16-alpine")
    rd = RedisContainer("redis:7-alpine")
    pg.start()
    rd.start()
    try:
        pg_host, pg_port = pg.get_container_host_ip(), pg.get_exposed_port(5432)
        rd_host, rd_port = rd.get_container_host_ip(), rd.get_exposed_port(6379)
        yield {
            "database_url": f"postgresql+asyncpg://{pg.username}:{pg.password}@{pg_host}:{pg_port}/{pg.dbname}",
            "redis_url": f"redis://{rd_host}:{rd_port}/0",
        }
    finally:
        pg.stop()
        rd.stop()


@pytest.fixture(scope="session")
def base_settings(containers: dict[str, str]) -> Settings:
    return Settings(
        secret_key="test-secret-key-min-32-chars-long-enough",
        database_url=containers["database_url"],
        redis_url=containers["redis_url"],
        login_max_attempts=1000,  # throttling tested separately with low limits
    )


@pytest_asyncio.fixture(scope="session", loop_scope="session")
async def migrated_db(base_settings: Settings) -> None:
    engine = create_async_engine(base_settings.database_url)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    await engine.dispose()


@pytest_asyncio.fixture(loop_scope="function")
async def clean_db(base_settings: Settings, migrated_db: None) -> None:
    engine = create_async_engine(base_settings.database_url)
    async with engine.begin() as conn:
        await conn.execute(
            text("TRUNCATE TABLE projects, refresh_tokens, credentials, memberships, organizations, users CASCADE")
        )
    await engine.dispose()


def build_app(settings: Settings):
    return create_app(settings)


@pytest_asyncio.fixture(loop_scope="function")
async def application(base_settings: Settings, clean_db: None) -> AsyncIterator[Any]:
    application = build_app(base_settings)
    yield application
    await application.state.throttler.aclose()
    await application.state.session_factory.kw["bind"].dispose()


@pytest_asyncio.fixture(loop_scope="function")
async def client(application: Any) -> AsyncIterator[AsyncClient]:
    async with AsyncClient(transport=ASGITransport(app=application), base_url="http://test") as ac:
        yield ac


async def register_and_login(client: AsyncClient, email: str | None = None, password: str = "Str0ng!Pass") -> dict:
    email = email or f"user-{uuid.uuid4().hex[:8]}@example.com"
    reg = await client.post("/auth/register", json={"email": email, "password": password})
    assert reg.status_code == 201, reg.text
    login = await client.post("/auth/login", json={"email": email, "password": password})
    assert login.status_code == 200, login.text
    return {"email": email, "password": password, **login.json()}
