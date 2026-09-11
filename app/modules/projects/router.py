"""Project routes: every handler resolves `CurrentTenant` first."""

from fastapi import APIRouter, Depends, Request

from app.modules.entitlements.public import require_projects_access
from app.modules.projects.schemas import ProjectCreate, ProjectRead, ProjectUpdate
from app.modules.tenancy.public import TenantContext, current_tenant, require_role

_ADMIN = require_role("admin")

router = APIRouter(prefix="/projects", tags=["projects"])


def _service(request: Request):
    return request.app.state.project_service


@router.post("", response_model=ProjectRead, status_code=201)
async def create_project(
    payload: ProjectCreate,
    request: Request,
    tenant: TenantContext = Depends(current_tenant),
) -> ProjectRead:
    project = await _service(request).create(tenant_id=tenant.tenant_id, name=payload.name)
    return ProjectRead.model_validate(project)


@router.get("", response_model=list[ProjectRead])
async def list_projects(
    request: Request,
    tenant: TenantContext = Depends(current_tenant),
    _access=Depends(require_projects_access),
) -> list[ProjectRead]:
    projects = await _service(request).list(tenant_id=tenant.tenant_id)
    return [ProjectRead.model_validate(p) for p in projects]


@router.get("/{project_id}", response_model=ProjectRead)
async def get_project(
    project_id: str,
    request: Request,
    tenant: TenantContext = Depends(current_tenant),
    _access=Depends(require_projects_access),
) -> ProjectRead:
    project = await _service(request).get(tenant_id=tenant.tenant_id, project_id=project_id)
    return ProjectRead.model_validate(project)


@router.patch("/{project_id}", response_model=ProjectRead)
async def rename_project(
    project_id: str,
    payload: ProjectUpdate,
    request: Request,
    tenant: TenantContext = Depends(current_tenant),
) -> ProjectRead:
    project = await _service(request).rename(tenant_id=tenant.tenant_id, project_id=project_id, name=payload.name)
    return ProjectRead.model_validate(project)


@router.delete("/{project_id}", status_code=204)
async def delete_project(
    project_id: str,
    request: Request,
    tenant: TenantContext = Depends(current_tenant),
    _admin: TenantContext = Depends(_ADMIN),
) -> None:
    await _service(request).remove(tenant_id=tenant.tenant_id, project_id=project_id)
