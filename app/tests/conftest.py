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
import app.infrastructure.auth.password_resets  # noqa: F401
import app.infrastructure.auth.refresh_tokens  # noqa: F401
import app.infrastructure.auth.social  # noqa: F401 (change C model lives here)
import app.infrastructure.jobs.models  # noqa: F401
import app.modules.audit.models  # noqa: F401
import app.modules.entitlements.models  # noqa: F401
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

if os.name == "nt" and "TESTCONTAINERS_RYUK_DISABLED" not in os.environ:
    # Docker Desktop Windows races Ryuk's 8080 port-mapping lookup
    # (ConnectionError at testcontainers Reaper startup); fixtures already
    # stop/remove their containers explicitly, so auto-disable is safe here.
    os.environ["TESTCONTAINERS_RYUK_DISABLED"] = "true"

# Single source of truth for data-service images is the Makefile
# (`POSTGRES_IMAGE` / `REDIS_IMAGE` / `DOCKER`); same defaults here so a bare
# `pytest` (without make) resolves identical pins.
POSTGRES_IMAGE = os.environ.get("POSTGRES_IMAGE", "postgres:17-alpine")
REDIS_IMAGE = os.environ.get("REDIS_IMAGE", "valkey/valkey:9-alpine")
DOCKER_BIN = os.environ.get("DOCKER_BIN", "docker")


def wait_tcp(host: str, port: int, timeout: int = 90) -> None:
    """Block until a TCP port accepts (or raise). Works in both net modes.

    NOTE: docker's userland proxy accepts TCP before the process inside
    listens — for protocol readiness, prefer wait_smtp/wait_http below.
    """
    import socket
    import time

    deadline = time.time() + timeout
    while time.time() < deadline:
        try:
            with socket.create_connection((host, port), timeout=2):
                return
        except OSError:
            time.sleep(1)
    raise RuntimeError(f"tcp {host}:{port} not ready")


def wait_smtp(host: str, port: int, timeout: int = 90) -> None:
    """Block until a real SMTP greeting is served (not just TCP accept)."""
    import smtplib
    import time

    deadline = time.time() + timeout
    last: Exception | None = None
    while time.time() < deadline:
        try:
            with smtplib.SMTP(host, port, timeout=5) as smtp:
                smtp.noop()
                return
        except Exception as exc:  # noqa: BLE001 (readiness polling)
            last = exc
            time.sleep(1)
    raise RuntimeError(f"smtp {host}:{port} not ready: {last}")


def wait_http(url: str, timeout: int = 90) -> None:
    """Block until an HTTP 2xx/4xx is served (proves the app, not the proxy)."""
    import time

    import httpx

    deadline = time.time() + timeout
    while time.time() < deadline:
        try:
            resp = httpx.get(url, timeout=5)
            if resp.status_code < 500:
                return
        except Exception:
            time.sleep(1)
    raise RuntimeError(f"http {url} not ready")


class ServiceContainer:
    """One docker container in both network modes, with stderr on failure.

    Bridge (default): random host ports, read back after start.
    Host (`FB_TEST_NETWORK=host`): fixed ports, `--network host`.
    """

    def __init__(
        self,
        image: str,
        *,
        command=None,
        env: dict[str, str] | None = None,
        tcp_ports: list[int] | None = None,
        name: str,
    ) -> None:
        import docker

        self._docker = docker
        self._name = name
        self._tcp_ports = tcp_ports or []
        client = docker.from_env()
        try:
            client.images.get(image)
        except Exception:
            # Missing locally (or daemon quirk): pull explicitly so the
            # failure below — if any — is the real one, with its message.
            client.images.pull(image)
        if HOST_NET:
            self._container = client.containers.run(
                image,
                command=command,
                environment=env or {},
                network_mode="host",
                name=f"fb-test-{name}",
                detach=True,
                auto_remove=True,
            )
            self.ports = {port: port for port in self._tcp_ports}
        else:
            import time

            self._container = client.containers.run(
                image,
                command=command,
                environment=env or {},
                ports={f"{port}/tcp": ("127.0.0.1", None) for port in self._tcp_ports},
                name=f"fb-test-{name}",
                detach=True,
                auto_remove=True,
            )
            # Docker Desktop (notably Windows) may report NAT bindings a beat
            # after create: poll briefly before reading them back.
            self._container.reload()
            bound = self._container.ports or {}
            for _ in range(60):
                if all((bound.get(f"{port}/tcp") or []) for port in self._tcp_ports):
                    break
                time.sleep(0.5)
                self._container.reload()
                bound = self._container.ports or {}
            self.ports = {}
            for port in self._tcp_ports:
                bindings = bound.get(f"{port}/tcp") or []
                if not bindings:
                    raise RuntimeError(f"port {port} not bound for {name}")
                self.ports[port] = int(bindings[0]["HostPort"])

    def stop(self) -> None:
        try:
            self._container.stop(timeout=5)
        except self._docker.errors.NotFound:
            pass


@pytest.fixture(scope="session")
def containers() -> Iterator[dict[str, str]]:
    if HOST_NET:
        import asyncio
        import subprocess

        def run(*args: str) -> None:
            subprocess.run([DOCKER_BIN, *args], check=True, capture_output=True)

        run("pull", POSTGRES_IMAGE)
        run("pull", REDIS_IMAGE)
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
            POSTGRES_IMAGE,
        )
        run("run", "-d", "--rm", "--network", "host", "--name", "fb-test-redis", REDIS_IMAGE)
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
    pg = PostgresContainer(POSTGRES_IMAGE)
    rd = RedisContainer(REDIS_IMAGE)
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
            text(
                "TRUNCATE TABLE password_resets, linked_identities, projects, refresh_tokens, credentials, memberships,"
                " entitlement_grants, organizations, users, outbox_messages, audit_log CASCADE"
            )
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
