"""AuditRecorder port: append-only security trail. Implemented by modules/audit."""

from typing import Any, Protocol


class AuditRecorder(Protocol):
    async def record(
        self,
        *,
        tenant_id: str | None,
        actor_user_id: str | None,
        action: str,
        resource_type: str = "",
        resource_id: str = "",
        metadata: dict[str, Any] | None = None,
        ip: str | None = None,
        user_agent: str | None = None,
    ) -> None:
        """Append one audit row. Fire-and-record: raises only on infra failure."""
        ...


def client_ip(request: Any) -> str:
    """Best-effort client IP (duck-typed: no fastapi import, DAG-safe for modules)."""
    forwarded = request.headers.get("x-forwarded-for") if hasattr(request, "headers") else None
    if forwarded:
        return str(forwarded).split(",")[0].strip()
    client = getattr(request, "client", None)
    return str(getattr(client, "host", "unknown")) if client else "unknown"


def user_agent_of(request: Any) -> str | None:
    headers = getattr(request, "headers", None)
    return str(headers.get("user-agent")) if headers else None


async def audit_request(
    request: Any,
    *,
    action: str,
    tenant_id: str | None = None,
    actor_user_id: str | None = None,
    resource_type: str = "",
    resource_id: str = "",
    metadata: dict[str, Any] | None = None,
) -> None:
    """One-liner for routers: records via `app.state.audit_recorder` (None = disabled)."""
    recorder = getattr(getattr(request, "app", None), "state", None)
    recorder = getattr(recorder, "audit_service", None) if recorder else None
    if recorder is None:
        return
    await recorder.record(
        tenant_id=tenant_id,
        actor_user_id=actor_user_id,
        action=action,
        resource_type=resource_type,
        resource_id=resource_id,
        metadata=metadata,
        ip=client_ip(request),
        user_agent=user_agent_of(request),
    )
