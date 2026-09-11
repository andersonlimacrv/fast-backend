"""Deploy helpers: pure, tested decision logic. Workflows orchestrate, this decides.

Pipeline: resolve tag → deploy SHA → healthcheck-gate /readyz → rollback to
previous SHA on failure. Images are immutable (`:sha`, never `:latest`).
"""

from __future__ import annotations

import httpx


def image_for(image_repo: str, sha: str) -> str:
    """Validate inputs and build the immutable image reference."""
    if not image_repo or "/" not in image_repo:
        raise ValueError(f"invalid image repo: {image_repo!r}")
    if not sha or len(sha) < 7 or any(c not in "0123456789abcdef" for c in sha.lower()):
        raise ValueError(f"invalid git sha: {sha!r}")
    return f"{image_repo}:{sha.lower()}"


def ready_state(readyz_url: str, timeout: int = 10) -> str:
    """Probe readiness: 'ready' | 'degraded' | 'down'. Never raises."""
    try:
        resp = httpx.get(readyz_url, timeout=timeout)
        if resp.status_code != 200:
            return "down"
        body = resp.text
        return "ready" if '"status": "ready"' in body or '"status":"ready"' in body else "degraded"
    except Exception:
        return "down"


def should_rollback(probe_results: list[str], *, required_ready: int = 1) -> bool:
    """Rollback unless at least `required_ready` probes report ready."""
    return sum(1 for r in probe_results if r == "ready") < required_ready


def rollback_target(history: list[str], failed_sha: str) -> str | None:
    """Previous successfully deployed SHA, skipping the failed one. None = nothing to roll back to."""
    seen = []
    for sha in history:
        if sha != failed_sha and sha not in seen:
            seen.append(sha)
    return seen[-1] if seen else None
