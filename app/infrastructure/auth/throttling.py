"""Throttling for login/refresh over Redis. Key: (ip, canonical email)."""

import redis.asyncio as redis

from app.core.errors import ThrottledError
from app.core.settings import Settings


class LoginThrottler:
    def __init__(self, settings: Settings, client: redis.Redis | None = None) -> None:
        self._settings = settings
        self._client = client or redis.from_url(settings.redis_url, decode_responses=True)

    def _key(self, ip: str, email: str) -> str:
        return f"login:{ip}:{email.strip().lower()}"

    async def check(self, ip: str, email: str) -> None:
        count = await self._client.get(self._key(ip, email))
        if count is not None and int(count) >= self._settings.login_max_attempts:
            raise ThrottledError("too many attempts")

    async def record_failure(self, ip: str, email: str) -> None:
        key = self._key(ip, email)
        pipe = self._client.pipeline()
        pipe.incr(key)
        pipe.expire(key, self._settings.login_window_seconds)
        await pipe.execute()

    async def reset(self, ip: str, email: str) -> None:
        await self._client.delete(self._key(ip, email))

    async def aclose(self) -> None:
        await self._client.aclose()
