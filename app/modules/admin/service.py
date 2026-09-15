"""AdminService: privileged operations. Never raises HTTPException.

Policies (who may act) are enforced here AND at the router dependencies
(defense in depth). Every mutation requires `reason`; callers (routers) audit
with `reason+success` in metadata (AdminAction via metadata, ADR 0005).
"""

from app.core.errors import OrganizationAccessDeniedError, UserNotFoundError
from app.modules.admin.dependencies import AdminContext
from app.modules.admin.policies import assert_can_manage_staff, assert_not_self, assert_valid_reason
from app.modules.audit.public import AuditService
from app.modules.identity.public import (
    AuthenticationService,
    admin_initiate_reset,
    count_users,
    create_user_by_admin,
    get_user_by_id,
    list_users,
    set_user_active,
    set_user_staff,
)
from app.modules.organization.public import (
    OrganizationService,
    admin_remove_membership,
    admin_set_membership,
    count_organizations,
    list_organizations,
)
from app.modules.projects.public import ProjectService, count_all_projects
from app.modules.tenancy.public import SuperuserContext


class AdminService:
    def __init__(
        self,
        *,
        identity: AuthenticationService,
        organizations: OrganizationService,
        projects: ProjectService,
        audit: AuditService,
    ) -> None:
        self._identity = identity
        self._organizations = organizations
        self._projects = projects
        self._audit = audit

    # --- reads (staff+) ---

    async def overview(self, *, ctx: AdminContext) -> dict[str, int]:
        _ = ctx
        return {
            "users": await count_users(self._identity),
            "organizations": await count_organizations(self._organizations),
            "projects": await count_all_projects(self._projects, superuser=SuperuserContext(reason="admin overview")),
        }

    async def get_user(self, *, ctx: AdminContext, user_id: str):
        _ = ctx
        user = await get_user_by_id(self._identity, user_id=user_id)
        if user is None:
            raise UserNotFoundError("user not found")
        return user

    async def list_all_users(self, *, ctx: AdminContext, limit: int = 100, offset: int = 0):
        _ = ctx
        return await list_users(self._identity, limit=min(limit, 500), offset=offset)

    async def list_all_organizations(self, *, ctx: AdminContext, limit: int = 100, offset: int = 0):
        _ = ctx
        return await list_organizations(self._organizations, limit=min(limit, 500), offset=offset)

    async def recent_audit(self, *, ctx: AdminContext, limit: int = 100):
        assert_can_manage_staff(ctx.level)
        return await self._audit.list_recent(limit=min(limit, 500))

    # --- mutations (reason required) ---

    async def create_user(self, *, ctx: AdminContext, email: str, password: str, reason: str):
        _ = ctx
        assert_valid_reason(reason)
        return await create_user_by_admin(self._identity, email=email, password=password)

    async def set_user_active(self, *, ctx: AdminContext, user_id: str, active: bool, reason: str):
        assert_valid_reason(reason)
        if not active:
            assert_not_self(actor_user_id=ctx.user_id, target_user_id=user_id, operation="disable")
        user = await set_user_active(self._identity, user_id=user_id, active=active)
        if user is None:
            raise UserNotFoundError("user not found")
        return user

    async def revoke_sessions(self, *, ctx: AdminContext, user_id: str, reason: str) -> None:
        assert_valid_reason(reason)
        user = await get_user_by_id(self._identity, user_id=user_id)
        if user is None:
            raise UserNotFoundError("user not found")
        await self._identity.invalidate_tokens(user_id=user_id)

    async def force_password_reset(self, *, ctx: AdminContext, user_id: str, reason: str, ip: str) -> None:
        """Staff+ privileged recovery: revoke sessions now, enqueue reset mail.

        Never returns the token/link (change B): the секреt travels only by email.
        """
        assert_valid_reason(reason)
        ok = await admin_initiate_reset(self._identity, user_id=user_id, ip=ip)
        if not ok:
            raise UserNotFoundError("user not found")

    async def grant_staff(self, *, ctx: AdminContext, user_id: str, reason: str):
        assert_can_manage_staff(ctx.level)
        assert_valid_reason(reason)
        assert_not_self(actor_user_id=ctx.user_id, target_user_id=user_id, operation="grant staff to")
        user = await set_user_staff(self._identity, user_id=user_id, staff=True)
        if user is None:
            raise UserNotFoundError("user not found")
        return user

    async def revoke_staff(self, *, ctx: AdminContext, user_id: str, reason: str):
        assert_can_manage_staff(ctx.level)
        assert_valid_reason(reason)
        assert_not_self(actor_user_id=ctx.user_id, target_user_id=user_id, operation="revoke staff from")
        user = await set_user_staff(self._identity, user_id=user_id, staff=False)
        if user is None:
            raise UserNotFoundError("user not found")
        return user

    async def set_membership(self, *, ctx: AdminContext, org_id: str, user_id: str, role: str, reason: str):
        _ = ctx
        assert_valid_reason(reason)
        if role not in ("owner", "admin", "member"):
            raise OrganizationAccessDeniedError("unknown role")
        return await admin_set_membership(self._organizations, org_id=org_id, user_id=user_id, role=role)

    async def remove_membership(self, *, ctx: AdminContext, org_id: str, user_id: str, reason: str) -> None:
        _ = ctx
        assert_valid_reason(reason)
        await admin_remove_membership(self._organizations, org_id=org_id, user_id=user_id)
