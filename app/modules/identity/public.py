"""Public API of the identity module. Other modules may import ONLY from here."""

from app.modules.identity.dependencies import Principal
from app.modules.identity.service import AuthenticationService

__all__ = ["AuthenticationService", "Principal", "get_user_by_id"]


async def get_user_by_id(service: AuthenticationService, *, user_id: str):
    """Deliberately exposed lookup for future modules (organization, invites)."""
    return await service.get_user(user_id=user_id)
