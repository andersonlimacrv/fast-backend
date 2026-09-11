"""Organization HTTP routes. Actor identity comes from identity's public surface."""

from fastapi import APIRouter, Depends, Request
from sqlalchemy import select

from app.core.contracts.audit import audit_request
from app.core.errors import OrganizationAccessDeniedError
from app.infrastructure.auth.jwt import mint_access_token
from app.modules.identity.public import Principal, current_principal
from app.modules.organization.models import Membership
from app.modules.organization.public import assert_membership
from app.modules.organization.schemas import (
    MemberAdd,
    MemberRoleUpdate,
    MembershipRead,
    OrganizationCreate,
    OrganizationRead,
    SwitchOrganizationRequest,
    SwitchTokenPair,
)

router = APIRouter(prefix="/organizations", tags=["organizations"])
auth_router = APIRouter(prefix="/auth", tags=["auth"])


def _service(request: Request):
    return request.app.state.org_service


@router.post("", response_model=OrganizationRead, status_code=201)
async def create_organization(
    payload: OrganizationCreate,
    request: Request,
    me: Principal = Depends(current_principal),
) -> OrganizationRead:
    org = await _service(request).create_organization(owner_user_id=me.user_id, name=payload.name)
    await audit_request(request, action="org.create", actor_user_id=me.user_id, tenant_id=org.id, resource_type="organization")
    return OrganizationRead.model_validate(org)


@router.get("", response_model=list[OrganizationRead])
async def list_my_organizations(request: Request, me: Principal = Depends(current_principal)) -> list[OrganizationRead]:
    pairs = await _service(request).list_user_orgs(user_id=me.user_id)
    return [OrganizationRead.model_validate(p.organization) for p in pairs]


@router.get("/{org_id}", response_model=OrganizationRead)
async def get_organization(org_id: str, request: Request, me: Principal = Depends(current_principal)) -> OrganizationRead:
    pairs = await _service(request).list_user_orgs(user_id=me.user_id)
    for pair in pairs:
        if pair.organization.id == org_id:
            return OrganizationRead.model_validate(pair.organization)
    raise OrganizationAccessDeniedError("access denied")


@router.get("/{org_id}/members", response_model=list[MembershipRead])
async def list_members(org_id: str, request: Request, me: Principal = Depends(current_principal)) -> list[MembershipRead]:
    service = _service(request)
    await service.require_membership(user_id=me.user_id, org_id=org_id)
    async with service._sessions() as session:
        rows = (await session.execute(select(Membership).where(Membership.org_id == org_id))).scalars()
        return [MembershipRead.model_validate(m) for m in rows]


@router.post("/{org_id}/members", response_model=MembershipRead, status_code=201)
async def add_member(
    org_id: str,
    payload: MemberAdd,
    request: Request,
    me: Principal = Depends(current_principal),
) -> MembershipRead:
    membership = await _service(request).add_member(
        actor_user_id=me.user_id, org_id=org_id, user_id=payload.user_id, role=payload.role
    )
    await audit_request(
        request,
        action="org.member_add",
        actor_user_id=me.user_id,
        tenant_id=org_id,
        resource_type="membership",
        resource_id=payload.user_id,
        metadata={"role": payload.role},
    )
    return MembershipRead.model_validate(membership)


@router.patch("/{org_id}/members/{user_id}", response_model=MembershipRead)
async def change_member_role(
    org_id: str,
    user_id: str,
    payload: MemberRoleUpdate,
    request: Request,
    me: Principal = Depends(current_principal),
) -> MembershipRead:
    membership = await _service(request).change_role(
        actor_user_id=me.user_id, org_id=org_id, user_id=user_id, role=payload.role
    )
    await audit_request(
        request,
        action="org.member_role_change",
        actor_user_id=me.user_id,
        tenant_id=org_id,
        resource_type="membership",
        resource_id=user_id,
        metadata={"role": payload.role},
    )
    return MembershipRead.model_validate(membership)


@router.delete("/{org_id}/members/{user_id}", status_code=204)
async def remove_member(
    org_id: str,
    user_id: str,
    request: Request,
    me: Principal = Depends(current_principal),
) -> None:
    await _service(request).remove_member(actor_user_id=me.user_id, org_id=org_id, user_id=user_id)
    await audit_request(
        request,
        action="org.member_remove",
        actor_user_id=me.user_id,
        tenant_id=org_id,
        resource_type="membership",
        resource_id=user_id,
    )


@auth_router.post("/switch-organization", response_model=SwitchTokenPair)
async def switch_organization(
    payload: SwitchOrganizationRequest,
    request: Request,
    me: Principal = Depends(current_principal),
) -> SwitchTokenPair:
    """Mint a new access token bound to the requested org — membership required.

    Lives here (not in identity) because only organization may enforce
    membership without violating the module DAG (ADR 0003).
    """
    service = _service(request)
    await assert_membership(service, user_id=me.user_id, org_id=payload.org_id)
    access_token = mint_access_token(settings=request.app.state.settings, user_id=me.user_id, active_org_id=payload.org_id)
    return SwitchTokenPair(access_token=access_token)
