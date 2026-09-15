"""Public release metadata. No auth, no DB, no PII — safe for the landing page.

Allowlist principle: the payload is built from literal keys only, so no
setting (secret, host, email) can ever leak through here. Covered by the
anti-leak test in `app/tests/unit/test_meta.py`.
"""

from fastapi import APIRouter, Request
from pydantic import BaseModel, ConfigDict

router = APIRouter(tags=["meta"])

# Mirrors the unconditional `include_router` calls in `app/main.py`.
_ALWAYS_ON = ("identity", "organization", "tenancy", "entitlements", "projects", "audit", "health")


class ModuleMeta(BaseModel):
    model_config = ConfigDict(frozen=True)

    key: str
    enabled: bool


class MetaRead(BaseModel):
    model_config = ConfigDict(frozen=True)

    app: str
    version: str
    modules: list[ModuleMeta]


@router.get("/meta", response_model=MetaRead)
async def read_meta(request: Request) -> MetaRead:
    settings = request.app.state.settings
    modules = [ModuleMeta(key=key, enabled=True) for key in _ALWAYS_ON]
    modules.append(ModuleMeta(key="admin", enabled=bool(settings.admin_enabled)))
    modules.append(ModuleMeta(key="billing", enabled=bool(settings.billing_enabled)))
    return MetaRead(app="fast-backend", version=settings.app_version, modules=modules)
