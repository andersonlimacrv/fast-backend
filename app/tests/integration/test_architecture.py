"""Architecture gate tests: import-linter contracts must hold and must bite."""

import shutil
import subprocess
import sys
from pathlib import Path

import pytest

REPO_ROOT = Path(__file__).resolve().parents[3]
PROBE = REPO_ROOT / "app" / "interfaces" / "_probe_forbidden.py"


def _run_lint() -> subprocess.CompletedProcess[str]:
    binary = shutil.which("lint-imports")
    # NOTE: compare against None, not a suffix — on Windows the binary is
    # `lint-imports.EXE`, and the `-m importlinter.cli` fallback no longer
    # exists in import-linter v2 (locked in uv.lock).
    cmd = [binary] if binary is not None else [sys.executable, "-m", "importlinter.cli"]
    return subprocess.run(
        cmd,
        cwd=REPO_ROOT,
        capture_output=True,
        text=True,
        timeout=120,
    )


@pytest.mark.integration
def test_contracts_hold_on_clean_tree() -> None:
    result = _run_lint()
    assert result.returncode == 0, result.stdout + result.stderr


@pytest.mark.integration
def test_gate_rejects_cross_module_internals() -> None:
    PROBE.write_text("from app.modules.identity.models import User  # noqa: F401\n")
    try:
        result = _run_lint()
    finally:
        PROBE.unlink(missing_ok=True)
    assert result.returncode != 0
    assert "identity-internals-private" in result.stdout + result.stderr


@pytest.mark.integration
def test_gate_rejects_provider_imports_in_modules() -> None:
    probe = REPO_ROOT / "app" / "modules" / "projects" / "_probe_sdk.py"
    probe.write_text("import aioboto3  # noqa: F401\n")
    try:
        result = _run_lint()
    finally:
        probe.unlink(missing_ok=True)
    assert result.returncode != 0
    assert "no-provider-imports-in-modules" in result.stdout + result.stderr


@pytest.mark.integration
def test_gate_rejects_module_to_module_internals() -> None:
    probe = REPO_ROOT / "app" / "modules" / "projects" / "_probe_sibling.py"
    probe.write_text("from app.modules.entitlements.service import EntitlementService  # noqa: F401\n")
    try:
        result = _run_lint()
    finally:
        probe.unlink(missing_ok=True)
    assert result.returncode != 0
    assert "entitlements-internals-private" in result.stdout + result.stderr
