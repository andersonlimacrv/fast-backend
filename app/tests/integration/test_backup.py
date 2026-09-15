"""Backup unit tests (naming, prune, passphrase refusal) + real restore drill."""

import re
from datetime import UTC, datetime
from pathlib import Path

import pytest

from scripts.backup import artifact_name, backup_postgres, prune


@pytest.mark.unit
def test_artifact_name_format() -> None:
    name = artifact_name("fastbackend", datetime(2026, 9, 11, 6, 0, tzinfo=UTC))
    assert name == "fastbackend-20260911T060000Z.dump.gz.enc"
    assert re.fullmatch(r"fastbackend-\d{8}T\d{6}Z\.dump\.gz\.enc", artifact_name())


@pytest.mark.unit
def test_prune_keeps_retention(tmp_path: Path) -> None:
    for day in range(1, 11):
        (tmp_path / f"fastbackend-202609{day:02d}T000000Z.dump.gz.enc").write_bytes(b"x")
    deleted = prune(tmp_path, retention=7)
    assert len(deleted) == 3
    assert len(list(tmp_path.glob("*.enc"))) == 7


@pytest.mark.unit
def test_no_passphrase_refuses(tmp_path: Path) -> None:
    with pytest.raises(ValueError, match="PASSPHRASE"):
        backup_postgres("postgresql://u:p@localhost/db", tmp_path, "")


@pytest.mark.integration
@pytest.mark.slow
async def test_backup_restore_drill(base_settings) -> None:
    """Seed → backup → drop → restore → data back, on a dedicated database."""
    import asyncpg
    from sqlalchemy import text
    from sqlalchemy.ext.asyncio import create_async_engine

    from app.infrastructure.db.base import Base
    from scripts.backup import restore_postgres

    admin_url = base_settings.database_url.rsplit("/", 1)[0] + "/postgres"
    drill_url = base_settings.database_url.rsplit("/", 1)[0] + "/fb_drill"
    admin = await asyncpg.connect(admin_url.replace("+asyncpg", ""), timeout=10)
    try:
        await admin.execute("DROP DATABASE IF EXISTS fb_drill WITH (FORCE)")
        await admin.execute("CREATE DATABASE fb_drill")
    finally:
        await admin.close()

    engine = create_async_engine(drill_url)
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        async with engine.connect() as conn:
            await conn.execute(
                text(
                    "INSERT INTO users (id, email, is_active, is_superuser, is_staff)"
                    " VALUES ('u1', 'drill@example.com', TRUE, FALSE, FALSE)"
                )
            )
            await conn.execute(text("INSERT INTO organizations (id, name, slug) VALUES ('o1', 'Drill', 'drill')"))
            await conn.execute(text("INSERT INTO memberships (id, user_id, org_id, role) VALUES ('m1', 'u1', 'o1', 'owner')"))
            await conn.execute(text("INSERT INTO projects (id, org_id, name) VALUES ('p1', 'o1', 'seeded')"))
            await conn.commit()

        import tempfile

        with tempfile.TemporaryDirectory() as tmp:
            dest = Path(tmp)
            artifact = backup_postgres(drill_url, dest, "drill-passphrase", retention=7)
            assert artifact.exists() and artifact.stat().st_size > 0
            assert artifact.read_bytes()[:8] != b"\x1f\x8b\x08\x00"  # encrypted, not raw gzip

            await engine.dispose()
            admin2 = await asyncpg.connect(admin_url.replace("+asyncpg", ""), timeout=10)
            try:
                await admin2.execute("DROP DATABASE fb_drill WITH (FORCE)")
                await admin2.execute("CREATE DATABASE fb_drill")
            finally:
                await admin2.close()

            restore_postgres(drill_url, artifact, "drill-passphrase")

            engine2 = create_async_engine(drill_url)
            try:
                async with engine2.connect() as conn2:
                    email = (await conn2.execute(text("SELECT email FROM users WHERE id='u1'"))).scalar()
                    pname = (await conn2.execute(text("SELECT name FROM projects WHERE id='p1'"))).scalar()
                    role = (await conn2.execute(text("SELECT role FROM memberships WHERE id='m1'"))).scalar()
                assert email == "drill@example.com"
                assert pname == "seeded"
                assert role == "owner"
            finally:
                await engine2.dispose()
    finally:
        await engine.dispose()
        admin3 = await asyncpg.connect(admin_url.replace("+asyncpg", ""), timeout=10)
        try:
            await admin3.execute("DROP DATABASE IF EXISTS fb_drill WITH (FORCE)")
        finally:
            await admin3.close()
