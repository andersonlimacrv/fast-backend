"""Unit tests: TenantScopedRepository constructor guard (no I/O)."""

import pytest
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

from app.core.settings import Settings
from app.modules.tenancy.public import SuperuserContext, TenantScopedRepository


@pytest.mark.unit
async def test_repository_requires_tenant_or_superuser() -> None:
    factory = async_sessionmaker(create_async_engine(Settings(secret_key="x" * 32).database_url), expire_on_commit=False)
    async with factory() as session:
        with pytest.raises(ValueError):
            TenantScopedRepository(session, None)
        repo = TenantScopedRepository(session, "tenant-1")
        assert repo._tenant_id == "tenant-1"
        su = TenantScopedRepository.scoped_for_superuser(session, SuperuserContext(reason="t"))
        assert su._tenant_id is None
