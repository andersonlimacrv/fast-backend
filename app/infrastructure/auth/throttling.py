"""Throttling for auth endpoints over Redis. Keys: (ip, scope[, canonical email]).

Login keeps its historical `login:{ip}:{email}` buckets; newer scopes use a
namespace per scope (`register:{ip}`, `global:{ip}` — change rate-limit-global).
Every `check_*` raises the same generic `ThrottledError("too many attempts")`
(the body must never reveal which limit fired); the Redis key TTL feeds the
`Retry-After` header via `ThrottledError.retry_after`. The class keeps its
historical name `LoginThrottler` for import stability.
"""

import redis.asyncio as redis

from app.core.errors import ThrottledError
from app.core.settings import Settings


class LoginThrottler:
    def __init__(self, settings: Settings, client: redis.Redis | None = None) -> None:
        self._settings = settings
        self._client = client or redis.from_url(settings.redis_url, decode_responses=True)

    def _key(self, ip: str, email: str) -> str:
        return f"login:{ip}:{email.strip().lower()}"

    def _scope_key(self, scope: str, ip: str) -> str:
        return f"{scope}:{ip}"

    async def _check_key(self, key: str, limit: int, window_seconds: int) -> None:
        count = await self._client.get(key)
        if count is not None and int(count) >= limit:
            ttl = await self._client.ttl(key)
            raise ThrottledError("too many attempts", retry_after=ttl if ttl and ttl > 0 else window_seconds)

    async def _record_key(self, key: str, window_seconds: int) -> None:
        pipe = self._client.pipeline()
        pipe.incr(key)
        pipe.expire(key, window_seconds)
        await pipe.execute()

    async def check(self, ip: str, email: str) -> None:
        await self._check_key(self._key(ip, email), self._settings.login_max_attempts, self._settings.login_window_seconds)

    async def record_failure(self, ip: str, email: str) -> None:
        await self._record_key(self._key(ip, email), self._settings.login_window_seconds)

    async def reset(self, ip: str, email: str) -> None:
        await self._client.delete(self._key(ip, email))

    # --- Registration scope (change rate-limit-global): per-IP failure budget. ---

    async def check_register(self, ip: str) -> None:
        await self._check_key(
            self._scope_key("register", ip), self._settings.register_max_attempts, self._settings.register_window_seconds
        )

    async def record_register_failure(self, ip: str) -> None:
        await self._record_key(self._scope_key("register", ip), self._settings.register_window_seconds)

    # --- Global scope (change rate-limit-global): per-IP anti-abuse ceiling. ---

    async def check_global(self, ip: str) -> None:
        await self._check_key(
            self._scope_key("global", ip),
            self._settings.rate_limit_global_max_attempts,
            self._settings.rate_limit_global_window_seconds,
        )

    async def record_global(self, ip: str) -> None:
        await self._record_key(self._scope_key("global", ip), self._settings.rate_limit_global_window_seconds)

    async def aclose(self) -> None:
        await self._client.aclose()
