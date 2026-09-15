"""Admin control plane (leaf module): privileged operations over explicit policies.

Not a CRUD layer: every mutation is a named action guarded by
`require_staff`/`require_root`, validated `reason`, and audited with
`reason+success` in metadata (AdminAction via metadata, ADR 0005).
"""

from app.modules.admin.service import AdminService

__all__ = ["AdminService"]
