"""Unit tests: local storage roundtrip (zero infra)."""

from pathlib import Path

import pytest

from app.core.settings import Settings
from app.infrastructure.storage.local import LocalFilesystemStorage


@pytest.fixture()
def storage(tmp_path: Path) -> LocalFilesystemStorage:
    return LocalFilesystemStorage(
        Settings(secret_key="x" * 32, storage_dir=str(tmp_path), frontend_url="https://app.example.com")
    )


@pytest.mark.unit
async def test_put_get_exists_delete(storage: LocalFilesystemStorage) -> None:
    assert await storage.exists(key="a/b.bin") is False
    await storage.put(key="a/b.bin", data=b"\x00\x01", content_type="application/octet-stream")
    assert await storage.exists(key="a/b.bin") is True
    assert await storage.get(key="a/b.bin") == b"\x00\x01"
    await storage.delete(key="a/b.bin")
    assert await storage.exists(key="a/b.bin") is False
    await storage.delete(key="a/b.bin")  # idempotent


@pytest.mark.unit
async def test_get_missing_raises(storage: LocalFilesystemStorage) -> None:
    with pytest.raises(FileNotFoundError):
        await storage.get(key="nope")


@pytest.mark.unit
async def test_traversal_rejected(storage: LocalFilesystemStorage) -> None:
    for bad in ("../evil", "/abs", "..", "a/../../evil"):
        with pytest.raises(ValueError):
            await storage.put(key=bad, data=b"x")


@pytest.mark.unit
async def test_size_limit_enforced(tmp_path: Path) -> None:
    small = LocalFilesystemStorage(
        Settings(secret_key="x" * 32, storage_dir=str(tmp_path), storage_max_bytes=2, frontend_url="https://app.example.com")
    )
    with pytest.raises(ValueError):
        await small.put(key="big", data=b"123")


@pytest.mark.unit
async def test_presigned_is_explicit_file_url(storage: LocalFilesystemStorage) -> None:
    await storage.put(key="f.txt", data=b"hi")
    url = await storage.presigned_url(key="f.txt")
    assert url.startswith("file://")
