"""Security headers middleware. No new dependencies (pure Starlette).

HSTS is sent only over HTTPS or in production: emitting it over plain HTTP
would poison browsers (HSTS is cached and hard to undo).
"""

from collections.abc import Awaitable, Callable

from starlette.requests import Request
from starlette.responses import Response

from app.core.settings import Settings

BASE_HEADERS = {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "same-origin",
}
HSTS_HEADER = ("Strict-Transport-Security", "max-age=31536000; includeSubDomains")


async def security_headers_middleware(request: Request, call_next: Callable[[Request], Awaitable[Response]]) -> Response:
    response = await call_next(request)
    for name, value in BASE_HEADERS.items():
        response.headers[name] = value
    settings: Settings = request.app.state.settings
    if request.url.scheme == "https" or settings.environment == "production":
        response.headers[HSTS_HEADER[0]] = HSTS_HEADER[1]
    return response
