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


def real_client_ip(x_forwarded_for: str | None, direct_ip: str | None, trusted_proxy_hops: int) -> str:
    """Resolve the real client IP from `X-Forwarded-For` + the direct TCP peer.

    Fail-closed: `trusted_proxy_hops <= 0` never honors the (client-forgeable)
    header and returns the direct peer. Otherwise hops are counted from the
    right (closest proxy last): `1` returns the last entry, `2` the one before
    it, and so on; more hops than entries clamps to the leftmost entry.
    Single copy of this rule (change proxy-hops-trusted): infrastructure
    re-exports it (`app/infrastructure/security/client_ip.py`) because core
    cannot import infrastructure (`core-independence`).
    """
    direct = (direct_ip or "").strip() or "unknown"
    if trusted_proxy_hops <= 0:
        return direct
    if not x_forwarded_for:
        return direct
    hops = [hop.strip() for hop in str(x_forwarded_for).split(",") if hop.strip()]
    if not hops:
        return direct
    return hops[max(0, len(hops) - trusted_proxy_hops)]


def client_ip(request: Any, trusted_proxy_hops: int = 0) -> str:
    """Best-effort client IP (duck-typed: no fastapi import, DAG-safe for modules)."""
    forwarded = request.headers.get("x-forwarded-for") if hasattr(request, "headers") else None
    client = getattr(request, "client", None)
    direct = getattr(client, "host", None) if client else None
    return real_client_ip(str(forwarded) if forwarded else None, str(direct) if direct else None, trusted_proxy_hops)


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
    state = getattr(getattr(request, "app", None), "state", None)
    recorder = getattr(state, "audit_service", None) if state else None
    if recorder is None:
        return
    trusted_hops = getattr(getattr(state, "settings", None), "trusted_proxy_hops", 0) or 0
    await recorder.record(
        tenant_id=tenant_id,
        actor_user_id=actor_user_id,
        action=action,
        resource_type=resource_type,
        resource_id=resource_id,
        metadata=metadata,
        ip=client_ip(request, trusted_hops),
        user_agent=user_agent_of(request),
    )
