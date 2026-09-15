"""E2E SPA-equivalent flow against a running local API (dev only).

Exercises the same endpoints the /client SPA uses: health, auth, orgs,
tenant switch, projects CRUD, grants, audit, and the SPA CORS origin.
Requires the API up (`make api`) with a migrated database (`make db-up`
+ `make migrate`).

Usage: python scripts/e2e_spa_flow.py [--base-url URL]
Env: E2E_BASE_URL (default http://127.0.0.1:8000),
     E2E_SPA_ORIGIN (default http://localhost:5173).
"""

from __future__ import annotations

import argparse
import json
import os
import urllib.error
import urllib.request
import uuid

BASE = os.environ.get("E2E_BASE_URL", "http://127.0.0.1:8000")
SPA_ORIGIN = os.environ.get("E2E_SPA_ORIGIN", "http://localhost:5173")
EMAIL = f"e2e-{uuid.uuid4().hex[:8]}@example.com"
PASSWORD = "Str0ng!Passw0rd"  # noqa: S105 (throwaway local-dev account)

results: list[tuple[str, bool, str]] = []


def call(
    method: str,
    path: str,
    body: dict | None = None,
    token: str | None = None,
    origin: str | None = None,
) -> tuple[int, dict, str]:
    req = urllib.request.Request(
        BASE + path,
        data=json.dumps(body).encode() if body is not None else None,
        method=method,
        headers={"Content-Type": "application/json"},
    )
    if token:
        req.add_header("Authorization", f"Bearer {token}")
    if origin:
        req.add_header("Origin", origin)
    try:
        with urllib.request.urlopen(req) as resp:
            return resp.status, dict(resp.headers), resp.read().decode()
    except urllib.error.HTTPError as exc:
        return exc.code, dict(exc.headers), exc.read().decode()


def check(name: str, cond: bool, detail: str = "") -> None:
    results.append((name, cond, detail))
    print(("PASS " if cond else "FAIL ") + name, detail)


def main() -> int:
    global BASE
    parser = argparse.ArgumentParser(description="E2E flow against local API.")
    parser.add_argument("--base-url", default=BASE)
    args = parser.parse_args()
    BASE = args.base_url

    s, _, _ = call("GET", "/healthz")
    check("healthz", s == 200, str(s))

    s, _, _ = call("GET", "/auth/me")
    check("me-without-token-401", s == 401, str(s))

    s, _, b = call("POST", "/auth/register", {"email": EMAIL, "password": PASSWORD})
    check("register", s in (200, 201), f"{s} {b}")

    s, _, b = call("POST", "/auth/login", {"email": EMAIL, "password": PASSWORD})
    check("login", s == 200, str(s))
    access = json.loads(b)["access_token"]

    s, _, _ = call("GET", "/auth/me", token=access)
    check("me-with-token", s == 200, str(s))

    s, _, b = call("POST", "/organizations", {"name": "E2E Org"}, token=access)
    check("create-org", s in (200, 201), f"{s} {b}")
    org_id = json.loads(b).get("id")

    s, _, b = call("POST", "/auth/switch-organization", {"org_id": org_id}, token=access)
    check("switch-org", s == 200, f"{s} {b}")
    access2 = json.loads(b).get("access_token", access)

    s, _, b = call("POST", "/projects", {"name": "E2E Project"}, token=access2)
    check("create-project", s in (200, 201), f"{s} {b}")
    proj_id = json.loads(b).get("id")

    s, _, _ = call("GET", "/projects", token=access2)
    check("list-projects", s == 200, str(s))
    s, _, _ = call("GET", f"/projects/{proj_id}", token=access2)
    check("get-project", s == 200, str(s))
    s, _, _ = call("PATCH", f"/projects/{proj_id}", {"name": "E2E Renamed"}, token=access2)
    check("patch-project", s == 200, str(s))
    s, _, _ = call("DELETE", f"/projects/{proj_id}", token=access2)
    check("delete-project", s in (200, 204), str(s))

    s, _, _ = call("GET", f"/organizations/{org_id}/grants", token=access2)
    check("grants-admin", s == 200, str(s))
    s, _, _ = call("GET", f"/organizations/{org_id}/audit", token=access2)
    check("audit", s == 200, str(s))

    s, headers, _ = call("GET", "/auth/me", token=access, origin=SPA_ORIGIN)
    acao = headers.get("access-control-allow-origin")
    check("cors-spa-origin", s == 200 and acao == SPA_ORIGIN, f"{s} ACAO={acao}")

    failed = [n for n, ok, _ in results if not ok]
    print(f"\n{len(results) - len(failed)}/{len(results)} passed")
    return 1 if failed else 0


if __name__ == "__main__":
    raise SystemExit(main())
