"""Ephemeral OIDC state and exchange grants in Redis (change login-social-redesign).

- `state` entry: `{code_verifier, nonce, redirect_uri, provider}`, single-use
  (`GETDEL`) with a 10 min default TTL.
- exchange grant: `{user_id, family_id, provider}`, single-use with a 60 s
  default TTL. The refresh token is minted only when the SPA exchanges it, so
  an abandoned grant leaves no usable session behind.

Keys are SHA-256 of the opaque value, so a Redis dump does not expose usable
state/grant strings. Failures are fail-closed (`SocialLoginError`), never a
login without state.
"""

from __future__ import annotations

import hashlib
import json
from typing import Any

import redis.asyncio as redis

from app.core.errors import SocialLoginError
from app.core.settings import Settings


class OIDCStateStore:
    def __init__(self, settings: Settings, client: redis.Redis | None = None) -> None:
        self._settings = settings
        self._client = client or redis.from_url(settings.redis_url, decode_responses=True)

    @staticmethod
    def _key(kind: str, value: str) -> str:
        digest = hashlib.sha256(value.encode()).hexdigest()
        return f"oidc:{kind}:{digest}"

    async def _put(self, key: str, payload: dict[str, Any], ttl: int) -> None:
        try:
            await self._client.set(key, json.dumps(payload, separators=(",", ":")), ex=ttl)
        except redis.RedisError as exc:
            raise SocialLoginError("social login temporarily unavailable") from exc

    async def _consume(self, key: str) -> dict[str, Any] | None:
        try:
            raw = await self._client.getdel(key)
        except redis.RedisError as exc:
            raise SocialLoginError("social login temporarily unavailable") from exc
        if raw is None:
            return None
        try:
            payload = json.loads(raw)
        except ValueError:
            return None
        return payload if isinstance(payload, dict) else None

    async def put_state(self, state: str, *, code_verifier: str, nonce: str, redirect_uri: str, provider: str) -> None:
        await self._put(
            self._key("state", state),
            {"code_verifier": code_verifier, "nonce": nonce, "redirect_uri": redirect_uri, "provider": provider},
            self._settings.oidc_state_ttl_seconds,
        )

    async def consume_state(self, state: str) -> dict[str, Any] | None:
        return await self._consume(self._key("state", state))

    async def put_grant(self, grant: str, *, user_id: str, family_id: str, provider: str) -> None:
        await self._put(
            self._key("grant", grant),
            {"user_id": user_id, "family_id": family_id, "provider": provider},
            self._settings.oidc_exchange_ttl_seconds,
        )

    async def consume_grant(self, grant: str) -> dict[str, Any] | None:
        return await self._consume(self._key("grant", grant))

    async def aclose(self) -> None:
        await self._client.aclose()
