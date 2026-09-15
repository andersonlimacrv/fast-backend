"""Public API of the identity module. Other modules may import ONLY from here."""

from app.modules.identity.dependencies import Principal, current_principal
from app.modules.identity.service import AuthenticationService

__all__ = [
    "AuthenticationService",
    "Principal",
    "admin_initiate_reset",
    "count_superusers",
    "count_users",
    "create_superuser",
    "create_user_by_admin",
    "current_principal",
    "get_user_by_id",
    "list_users",
    "purge_expired_resets",
    "request_password_reset",
    "reset_password",
    "set_user_active",
    "set_user_staff",
]


async def get_user_by_id(service: AuthenticationService, *, user_id: str):
    """Deliberately exposed lookup for future modules (organization, invites)."""
    return await service.get_user(user_id=user_id)


async def count_superusers(service: AuthenticationService) -> int:
    return await service.count_superusers()


async def count_users(service: AuthenticationService) -> int:
    return await service.count_users()


async def list_users(service: AuthenticationService, *, limit: int = 100, offset: int = 0):
    return await service.list_users(limit=limit, offset=offset)


async def create_superuser(service: AuthenticationService, *, email: str, password: str):
    """Root bootstrap primitive (CLI only; service enforces single root)."""
    return await service.create_superuser(email=email, password=password)


async def create_user_by_admin(service: AuthenticationService, *, email: str, password: str):
    return await service.create_user_by_admin(email=email, password=password)


async def set_user_active(service: AuthenticationService, *, user_id: str, active: bool):
    return await service.set_active(user_id=user_id, active=active)


async def set_user_staff(service: AuthenticationService, *, user_id: str, staff: bool):
    return await service.set_staff(user_id=user_id, staff=staff)


async def request_password_reset(service: AuthenticationService, *, email: str, ip: str) -> str | None:
    return await service.request_reset(email=email, ip=ip)


async def reset_password(service: AuthenticationService, *, token: str, new_password: str, ip: str) -> None:
    await service.reset_password(token=token, new_password=new_password, ip=ip)


async def admin_initiate_reset(service: AuthenticationService, *, user_id: str, ip: str) -> bool:
    return await service.admin_initiate_reset(user_id=user_id, ip=ip)


async def purge_expired_resets(service: AuthenticationService, *, limit: int = 1000) -> int:
    return await service.purge_expired_resets(limit=limit)
