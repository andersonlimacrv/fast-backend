"""Public API of the audit module. Core services depend on the Recorder Protocol
in `core/contracts/audit.py` (never on this module); `main.py` injects this
implementation. Other modules may import ONLY from here."""

from app.modules.audit.models import AuditLog
from app.modules.audit.service import AuditService

__all__ = ["AuditLog", "AuditService"]
