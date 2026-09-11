"""Request-ID middleware + contextvar. No new dependencies."""

import contextvars
import logging
import uuid
from collections.abc import Awaitable, Callable

from starlette.requests import Request
from starlette.responses import Response

REQUEST_ID_HEADER = "X-Request-ID"

logger = logging.getLogger("app.request")

_request_id: contextvars.ContextVar[str] = contextvars.ContextVar("request_id", default="-")


def get_request_id() -> str:
    return _request_id.get()


async def request_id_middleware(request: Request, call_next: Callable[[Request], Awaitable[Response]]) -> Response:
    incoming = request.headers.get(REQUEST_ID_HEADER)
    rid = incoming.strip() if incoming and incoming.strip() else uuid.uuid4().hex
    _request_id.set(rid)
    response = await call_next(request)
    response.headers[REQUEST_ID_HEADER] = rid
    logger.info("%s %s -> %s", request.method, request.url.path, response.status_code)
    return response
