"""OrganizationService: orgs, memberships, fixed roles. Never raises HTTPException."""

from __future__ import annotations

import re
import uuid
from dataclasses import dataclass

from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker

from app.core.errors import (
    LastOwnerProtectedError,
    OrganizationAccessDeniedError,
    SlugUnavailableError,
    UserNotFoundError,
)
from app.modules.identity.public import get_user_by_id
from app.modules.identity.service import AuthenticationService
from app.modules.organization.models import ADMIN, MEMBER, OWNER, Membership, Organization, role_at_least


@dataclass(frozen=True)
class OrgWithRole:
    organization: Organization
    role: str


def slugify(name: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", name.strip().lower()).strip("-")
    return slug or "org"


class OrganizationService:
    def __init__(
        self,
        session_factory: async_sessionmaker[AsyncSession],
        identity_service: AuthenticationService,
    ) -> None:
        self._sessions = session_factory
        self._identity = identity_service

    async def create_organization(self, *, owner_user_id: str, name: str) -> Organization:
        base = slugify(name)
        async with self._sessions() as session:
            for attempt in range(3):
                slug = base if attempt == 0 else f"{base}-{uuid.uuid4().hex[:6]}"
                try:
                    async with session.begin_nested():
                        org = Organization(name=name.strip(), slug=slug)
                        session.add(org)
                        await session.flush()
                        session.add(Membership(user_id=owner_user_id, org_id=org.id, role=OWNER))
                    await session.commit()
                    return org
                except IntegrityError:
                    continue
            raise SlugUnavailableError("could not mint a unique slug")

    async def get_membership(self, *, user_id: str, org_id: str) -> Membership | None:
        async with self._sessions() as session:
            membership = await session.scalar(
                select(Membership).where(Membership.user_id == user_id, Membership.org_id == org_id)
            )
            assert membership is None or isinstance(membership, Membership)
            return membership

    async def require_membership(self, *, user_id: str, org_id: str, minimum_role: str = MEMBER) -> Membership:
        membership = await self.get_membership(user_id=user_id, org_id=org_id)
        if membership is None or not role_at_least(membership.role, minimum_role):
            # Deliberately indistinguishable: missing org and missing membership
            # both deny, so org existence never leaks (anti-enumeration).
            raise OrganizationAccessDeniedError("access denied")
        return membership

    async def list_user_orgs(self, *, user_id: str) -> list[OrgWithRole]:
        async with self._sessions() as session:
            rows = (
                await session.execute(
                    select(Organization, Membership.role)
                    .join(Membership, Membership.org_id == Organization.id)
                    .where(Membership.user_id == user_id)
                    .order_by(Organization.created_at)
                )
            ).all()
            return [OrgWithRole(organization=org, role=role) for org, role in rows]

    async def add_member(self, *, actor_user_id: str, org_id: str, user_id: str, role: str) -> Membership:
        await self.require_membership(user_id=actor_user_id, org_id=org_id, minimum_role=ADMIN)
        if await get_user_by_id(self._identity, user_id=user_id) is None:
            raise UserNotFoundError("user not found")
        async with self._sessions() as session:
            async with session.begin():
                existing = await session.scalar(
                    select(Membership).where(Membership.user_id == user_id, Membership.org_id == org_id)
                )
                if existing is not None:
                    existing.role = role
                    return existing
                membership = Membership(user_id=user_id, org_id=org_id, role=role)
                session.add(membership)
            return membership

    async def _owner_count(self, session: AsyncSession, org_id: str) -> int:
        return int(
            await session.scalar(
                select(func.count()).select_from(Membership).where(Membership.org_id == org_id, Membership.role == OWNER)
            )
            or 0
        )

    async def remove_member(self, *, actor_user_id: str, org_id: str, user_id: str) -> None:
        await self.require_membership(user_id=actor_user_id, org_id=org_id, minimum_role=ADMIN)
        async with self._sessions() as session:
            async with session.begin():
                target = await session.scalar(
                    select(Membership).where(Membership.user_id == user_id, Membership.org_id == org_id)
                )
                if target is None:
                    return
                if target.role == OWNER and await self._owner_count(session, org_id) <= 1:
                    raise LastOwnerProtectedError("cannot remove the last owner")
                await session.delete(target)

    async def change_role(self, *, actor_user_id: str, org_id: str, user_id: str, role: str) -> Membership:
        await self.require_membership(user_id=actor_user_id, org_id=org_id, minimum_role=ADMIN)
        async with self._sessions() as session:
            async with session.begin():
                target = await session.scalar(
                    select(Membership).where(Membership.user_id == user_id, Membership.org_id == org_id)
                )
                if target is None:
                    raise OrganizationAccessDeniedError("access denied")
                if target.role == OWNER and role != OWNER and await self._owner_count(session, org_id) <= 1:
                    raise LastOwnerProtectedError("cannot demote the last owner")
                target.role = role
            return target
