"""Integration: generic OIDC social login (real Postgres+Redis, fake provider).

Covers the security-critical paths that unit tests cannot: Redis single-use
state/grant, cookie binding, account linking and flag-off surface.
"""

from dataclasses import dataclass
from urllib.parse import parse_qs, urlsplit

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy import func, select

from app.infrastructure.auth.social import LinkedIdentity
from app.main import create_app
from app.modules.identity.models import User
from app.tests.conftest import register_and_login


@dataclass(frozen=True)
class FakeProfile:
    provider: str
    provider_sub: str
    email: str | None
    email_verified: bool


class FakeProvider:
    """Minimal OIDC provider: the service only sees the Protocol surface."""

    provider = "oidc"

    def __init__(self) -> None:
        self.profile = FakeProfile("oidc", "sub-1", "ada@example.com", True)
        self.authorize_calls: list[dict[str, str]] = []
        self.exchange_calls: list[str] = []

    async def discover(self) -> None:
        return None

    def authorize_url(self, *, state: str, code_challenge: str, redirect_uri: str, nonce: str) -> str:
        self.authorize_calls.append(
            {"state": state, "code_challenge": code_challenge, "redirect_uri": redirect_uri, "nonce": nonce}
        )
        return f"https://idp.example.com/authorize?state={state}&code_challenge={code_challenge}"

    async def exchange_code(self, *, code: str, code_verifier: str, redirect_uri: str) -> dict:
        assert code_verifier, "PKCE verifier must come from the Redis state entry"
        self.exchange_calls.append(code)
        return {"access_token": "fake-access", "id_token": None}

    async def get_profile(self, *, access_token: str, id_token: str | None = None, nonce: str | None = None) -> FakeProfile:
        assert access_token == "fake-access"
        return self.profile

    async def aclose(self) -> None:
        return None


@pytest_asyncio.fixture(loop_scope="function")
async def social_app(base_settings, clean_db: None):
    settings = base_settings.model_copy(
        update={
            "social_login_enabled": True,
            "oidc_issuer": "https://idp.example.com",
            "oidc_client_id": "client-123",
            "oidc_client_secret": "s3cret",
            # http (not https) keeps the binding cookie non-Secure so the
            # in-memory ASGI client can replay it.
            "oidc_redirect_uri": "http://localhost:8001/auth/social/oidc/callback",
        }
    )
    app = create_app(settings)
    service = app.state.social_service
    assert service is not None
    await service._provider.aclose()  # real adapter is never used here
    fake = FakeProvider()
    service._provider = fake
    try:
        yield app, fake
    finally:
        await service.aclose()
        await app.state.throttler.aclose()
        await app.state.session_factory.kw["bind"].dispose()


@pytest_asyncio.fixture(loop_scope="function")
async def social_client(social_app) -> AsyncClient:
    app, _fake = social_app
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        yield client


async def _authorize(client: AsyncClient) -> str:
    resp = await client.get("/auth/social/oidc/authorize")
    assert resp.status_code == 302, resp.text
    location = resp.headers["location"]
    assert location.startswith("https://idp.example.com/authorize?")
    return parse_qs(urlsplit(location).query)["state"][0]


async def _callback(client: AsyncClient, state: str, *, code: str = "fake-code") -> str:
    resp = await client.get(f"/auth/social/oidc/callback?code={code}&state={state}")
    assert resp.status_code == 302, resp.text
    return resp.headers["location"]


async def _grant(client: AsyncClient) -> str:
    state = await _authorize(client)
    location = await _callback(client, state)
    assert location.startswith("https://app.example.com/auth/social/callback?")
    return parse_qs(urlsplit(location).query)["code"][0]


@pytest.mark.integration
async def test_full_flow_creates_user_and_exchanges_grant(social_client: AsyncClient, social_app) -> None:
    app, fake = social_app
    meta = await social_client.get("/meta")
    assert meta.json()["social"] == {"enabled": True, "provider": "oidc", "display_name": "SSO"}

    state = await _authorize(social_client)
    assert len(state) >= 32
    assert fake.authorize_calls[0]["code_challenge"]
    assert fake.authorize_calls[0]["nonce"]

    location = await _callback(social_client, state)
    grant = parse_qs(urlsplit(location).query)["code"][0]
    assert grant != state and len(grant) >= 32

    exchanged = await social_client.post("/auth/social/exchange", json={"code": grant})
    assert exchanged.status_code == 200, exchanged.text
    tokens = exchanged.json()
    me = await social_client.get("/auth/me", headers={"Authorization": f"Bearer {tokens['access_token']}"})
    assert me.status_code == 200
    assert me.json()["email"] == "ada@example.com"

    # Grant is single-use.
    replay = await social_client.post("/auth/social/exchange", json={"code": grant})
    assert replay.status_code == 400

    async with app.state.session_factory() as session:
        linked = (await session.execute(select(LinkedIdentity))).scalars().all()
        assert len(linked) == 1
        assert linked[0].provider_sub == "sub-1"


@pytest.mark.integration
async def test_verified_email_links_existing_account(social_client: AsyncClient, social_app) -> None:
    app, fake = social_app
    await register_and_login(social_client, email="ada@example.com")
    async with app.state.session_factory() as session:
        existing = await session.scalar(select(User).where(User.email == "ada@example.com"))
        assert existing is not None
        existing_id = existing.id
    fake.profile = FakeProfile("oidc", "sub-existing", "ada@example.com", True)

    grant = await _grant(social_client)
    tokens = (await social_client.post("/auth/social/exchange", json={"code": grant})).json()
    me = await social_client.get("/auth/me", headers={"Authorization": f"Bearer {tokens['access_token']}"})
    assert me.json()["id"] == existing_id
    async with app.state.session_factory() as session:
        linked = (await session.execute(select(LinkedIdentity))).scalars().one()
        assert linked.user_id == existing_id


@pytest.mark.integration
async def test_unverified_email_is_refused_and_creates_nothing(social_client: AsyncClient, social_app) -> None:
    app, fake = social_app
    fake.profile = FakeProfile("oidc", "sub-ghost", "ghost@example.com", False)

    state = await _authorize(social_client)
    location = await _callback(social_client, state)
    assert location == "https://app.example.com/login?social_error=email"
    async with app.state.session_factory() as session:
        assert await session.scalar(select(func.count()).select_from(User)) == 0
        assert await session.scalar(select(func.count()).select_from(LinkedIdentity)) == 0


@pytest.mark.integration
async def test_replayed_state_is_refused(social_client: AsyncClient, social_app) -> None:
    app, fake = social_app
    state = await _authorize(social_client)
    await _callback(social_client, state)
    # Put the binding cookie back (a real attacker could not) to isolate the
    # Redis single-use rule from the cookie rule.
    social_client.cookies.set("oidc_state", state, path="/auth/social")
    location = await _callback(social_client, state)
    assert location == "https://app.example.com/login?social_error=provider"
    async with app.state.session_factory() as session:
        # The first callback legitimately created one link; the replay added none.
        assert await session.scalar(select(func.count()).select_from(LinkedIdentity)) == 1


@pytest.mark.integration
async def test_cancelled_and_unknown_provider(social_client: AsyncClient, social_app) -> None:
    cancelled = await social_client.get("/auth/social/oidc/callback?error=access_denied")
    assert cancelled.headers["location"] == "https://app.example.com/login?social_error=cancelled"
    unknown = await social_client.get("/auth/social/other/authorize")
    assert unknown.status_code == 404
    bad_grant = await social_client.post("/auth/social/exchange", json={"code": "x" * 40})
    assert bad_grant.status_code == 400


@pytest.mark.integration
async def test_flag_off_exposes_no_social_surface(application, client: AsyncClient) -> None:
    assert not [path for path in application.openapi()["paths"] if path.startswith("/auth/social")]
    meta = await client.get("/meta")
    assert meta.json()["social"] == {"enabled": False, "provider": None, "display_name": None}
