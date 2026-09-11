"""Liveness + readiness. `/healthz` never touches dependencies (Fase 1 contract)."""

import asyncio

import redis.asyncio as redis
from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse
from sqlalchemy import text

router = APIRouter(tags=["health"])

_CHECK_TIMEOUT_SECONDS = 2


async def _check_db(request: Request) -> bool:
    try:
        factory = request.app.state.session_factory
        engine = factory.kw["bind"]

        async def probe() -> None:
            async with engine.connect() as conn:
                await conn.execute(text("SELECT 1"))

        await asyncio.wait_for(probe(), timeout=_CHECK_TIMEOUT_SECONDS)
        return True
    except Exception:
        return False


async def _check_redis(request: Request) -> bool:
    client = None
    try:
        settings = request.app.state.settings
        client = redis.from_url(settings.redis_url)

        async def probe() -> None:
            assert client is not None
            await client.ping()

        await asyncio.wait_for(probe(), timeout=_CHECK_TIMEOUT_SECONDS)
        return True
    except Exception:
        return False
    finally:
        if client is not None:
            await client.aclose()


@router.get("/healthz")
async def healthz() -> dict[str, str]:
    return {"status": "ok"}


@router.get("/readyz")
async def readyz(request: Request) -> JSONResponse:
    db_ok, redis_ok = await asyncio.gather(_check_db(request), _check_redis(request))
    status_code = 200 if db_ok and redis_ok else 503
    return JSONResponse(
        status_code=status_code,
        content={
            "status": "ready" if status_code == 200 else "degraded",
            "db": "ok" if db_ok else "fail",
            "redis": "ok" if redis_ok else "fail",
        },
    )
