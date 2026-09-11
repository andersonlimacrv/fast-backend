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
from app.infrastructure.email.sender import LogEmailSender, SmtpEmailSender
from app.infrastructure.jobs.outbox import OutboxService
from app.infrastructure.observability.logging import setup_logging
from app.infrastructure.observability.request_id import request_id_middleware
from app.infrastructure.security.headers import security_headers_middleware
from app.infrastructure.storage.local import LocalFilesystemStorage
from app.infrastructure.storage.s3 import S3CompatibleStorage
from app.interfaces.errors import install_error_handlers
from app.interfaces.health import router as health_router
from app.modules.audit.router import router as audit_router
from app.modules.audit.service import AuditService
from app.modules.entitlements.router import router as entitlements_router
from app.modules.entitlements.service import EntitlementService
from app.modules.identity.router import router as identity_router
from app.modules.identity.service import AuthenticationService
from app.modules.organization.router import auth_router as org_auth_router
from app.modules.organization.router import router as organization_router
from app.modules.organization.service import OrganizationService
from app.modules.projects.router import router as projects_router
from app.modules.projects.service import ProjectService


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    yield
    throttler: LoginThrottler = app.state.throttler
    await throttler.aclose()


def create_app(settings: Settings | None = None) -> FastAPI:
    setup_logging()
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
    app.state.org_service = OrganizationService(
        session_factory=session_factory,
        identity_service=app.state.auth_service,
    )
    app.state.entitlement_service = EntitlementService(session_factory=session_factory)
    app.state.project_service = ProjectService(
        session_factory=session_factory,
        entitlements=app.state.entitlement_service,
    )
    app.state.email_sender = SmtpEmailSender(settings) if settings.email_backend == "smtp" else LogEmailSender()
    app.state.storage = S3CompatibleStorage(settings) if settings.storage_backend == "s3" else LocalFilesystemStorage(settings)
    app.state.outbox = OutboxService(settings=settings, session_factory=session_factory)
    app.state.audit_service = AuditService(session_factory=session_factory)
    install_error_handlers(app)
    # Added in reverse execution order: request-id runs first (outermost).
    app.middleware("http")(security_headers_middleware)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.add_middleware(TrustedHostMiddleware, allowed_hosts=settings.trusted_hosts)
    app.middleware("http")(request_id_middleware)
    app.include_router(health_router)
    app.include_router(identity_router)
    app.include_router(organization_router)
    app.include_router(org_auth_router)
    app.include_router(entitlements_router)
    app.include_router(audit_router)
    app.include_router(projects_router)

    return app
