"""Public API of the admin module (leaf; no other module depends on it yet)."""

from app.modules.admin.dependencies import AdminContext, current_root, current_staff
from app.modules.admin.service import AdminService

__all__ = ["AdminContext", "AdminService", "current_root", "current_staff"]
