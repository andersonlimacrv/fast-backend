"""Application composition root: builds settings, db, auth, routes. No business logic."""

from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware

from app.core.settings import Settings
from app.infrastructure.auth.hashing import PwdlibHasher
from app.infrastructure.auth.refresh_tokens import RefreshTokenRepository
from app.infrastructure.auth.throttling import LoginThrottler
from app.infrastructure.db.session import create_session_factory
from app.infrastructure.security.headers import security_headers_middleware
from app.interfaces.errors import install_error_handlers
from app.interfaces.health import router as health_router
from app.modules.identity.router import router as identity_router
from app.modules.identity.service import AuthenticationService


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    yield
    throttler: LoginThrottler = app.state.throttler
    await throttler.aclose()


def create_app(settings: Settings | None = None) -> FastAPI:
    settings = settings or Settings()
    session_factory = create_session_factory(settings)
    hasher = PwdlibHasher(settings)
    refresh_repo = RefreshTokenRepository(settings)
    throttler = LoginThrottler(settings)

    app = FastAPI(title="fast-backend", lifespan=lifespan)
    app.state.settings = settings
    app.state.session_factory = session_factory
    app.state.throttler = throttler
    app.state.auth_service = AuthenticationService(
        settings=settings,
        session_factory=session_factory,
        hasher=hasher,
        refresh_repo=refresh_repo,
        throttler=throttler,
    )
    install_error_handlers(app)
    # Added in reverse execution order: TrustedHost runs first (outermost).
    app.middleware("http")(security_headers_middleware)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.add_middleware(TrustedHostMiddleware, allowed_hosts=settings.trusted_hosts)
    app.include_router(health_router)
    app.include_router(identity_router)

    return app
