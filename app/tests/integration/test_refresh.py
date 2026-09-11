"""Integration: rotation, reuse-revokes-family, concurrent consume (real Postgres)."""

import asyncio

import pytest
from httpx import AsyncClient
from sqlalchemy import select

from app.infrastructure.auth.refresh_tokens import RefreshToken, hash_refresh_token
from app.tests.conftest import register_and_login


@pytest.mark.integration
async def test_rotation_marks_used_and_links_successor(client: AsyncClient, application) -> None:
    data = await register_and_login(client)
    first = await client.post("/auth/refresh", json={"refresh_token": data["refresh_token"]})
    assert first.status_code == 200, first.text
    body = first.json()
    assert body["access_token"] and body["refresh_token"] != data["refresh_token"]

    factory = application.state.session_factory
    async with factory() as session:
        old = await session.scalar(
            select(RefreshToken).where(RefreshToken.token_hash == hash_refresh_token(data["refresh_token"]))
        )
        new = await session.scalar(
            select(RefreshToken).where(RefreshToken.token_hash == hash_refresh_token(body["refresh_token"]))
        )
        assert old is not None and old.used_at is not None
        assert new is not None and new.family_id == old.family_id
        assert old.replaced_by == new.id


@pytest.mark.integration
async def test_refresh_reuse_revokes_entire_family(client: AsyncClient) -> None:
    data = await register_and_login(client)

    first_rotation = await client.post("/auth/refresh", json={"refresh_token": data["refresh_token"]})
    assert first_rotation.status_code == 200
    r2 = first_rotation.json()["refresh_token"]

    reuse_attempt = await client.post("/auth/refresh", json={"refresh_token": data["refresh_token"]})
    assert reuse_attempt.status_code == 401

    r2_after_reuse = await client.post("/auth/refresh", json={"refresh_token": r2})
    assert r2_after_reuse.status_code == 401


@pytest.mark.integration
async def test_concurrent_refresh_single_winner(client: AsyncClient) -> None:
    data = await register_and_login(client)
    payload = {"refresh_token": data["refresh_token"]}

    results = await asyncio.gather(
        client.post("/auth/refresh", json=payload),
        client.post("/auth/refresh", json=payload),
    )
    statuses = sorted(r.status_code for r in results)
    assert statuses == [200, 401]
