"""Unit tests: TenantScopedRepository constructor guard (no I/O)."""

import inspect
import pathlib
import re

import pytest
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

from app.core.settings import Settings
from app.modules.tenancy.public import SuperuserContext, TenantScopedRepository


@pytest.mark.unit
async def test_repository_requires_tenant_or_superuser() -> None:
    factory = async_sessionmaker(
        create_async_engine(Settings(secret_key="x" * 32, frontend_url="https://app.example.com").database_url),
        expire_on_commit=False,
    )
    async with factory() as session:
        with pytest.raises(ValueError):
            TenantScopedRepository(session, None)
        repo = TenantScopedRepository(session, "tenant-1")
        assert repo._tenant_id == "tenant-1"
        su = TenantScopedRepository.scoped_for_superuser(session, SuperuserContext(reason="t"))
        assert su._tenant_id is None


@pytest.mark.unit
def test_superuser_context_default_preserved_option_b() -> None:
    """Decision 1.1 (Opção B): `reason` keeps its default — contract unbroken, use stays explicit."""
    assert SuperuserContext().reason == "support"
    assert inspect.signature(SuperuserContext).parameters["reason"].default == "support"


@pytest.mark.unit
def test_all_runtime_superuser_usages_pass_explicit_reason() -> None:
    """Every `SuperuserContext(` in runtime code passes `reason=` explicitly (Opção B convention)."""
    root = pathlib.Path(__file__).resolve().parents[3]
    app_dir = root / "app"
    assert app_dir.is_dir(), f"expected app dir at {app_dir} (guard against vacuous scans)"
    pattern = re.compile(r"SuperuserContext\((.*?)\)", re.DOTALL)
    reason_arg = re.compile(r"(?:^|,)\s*reason\s*=", re.MULTILINE)
    offenders: list[str] = []
    scanned = 0
    usages = 0
    for path in sorted(app_dir.rglob("*.py")):
        if "tests" in path.parts:
            continue
        scanned += 1
        code_lines = [line for line in path.read_text(encoding="utf-8").splitlines() if not line.lstrip().startswith("#")]
        for match in pattern.finditer("\n".join(code_lines)):
            usages += 1
            if not reason_arg.search(match.group(1)):
                offenders.append(f"{path.relative_to(root)}: {match.group(0)[:80]}")
    assert scanned > 0, "scan covered no runtime files (vacuous)"
    assert usages > 0, "scan found no SuperuserContext usages (vacuous)"
    assert offenders == []
