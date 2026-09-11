"""Integration: S3-compatible storage vs MinIO (slow, skipped without docker)."""

import shutil
import socket
import subprocess
import time

import pytest

from app.core.settings import Settings
from app.infrastructure.storage.s3 import S3CompatibleStorage

MINIO_IMAGE = "minio/minio:RELEASE.2025-04-22T22-12-26Z"
BUCKET = "fastbackend-test"


def _wait_port(host: str, port: int, timeout: int = 90) -> None:
    deadline = time.time() + timeout
    while time.time() < deadline:
        try:
            with socket.create_connection((host, port), timeout=2):
                return
        except OSError:
            time.sleep(1)
    raise RuntimeError("minio not ready")


@pytest.fixture()
def minio_storage():
    if shutil.which("docker") is None:
        pytest.skip("docker unavailable")
    subprocess.run(
        [
            "docker",
            "run",
            "-d",
            "--rm",
            "--network",
            "host",
            "--name",
            "fb-test-minio",
            "-e",
            "MINIO_ROOT_USER=minioadmin",
            "-e",
            "MINIO_ROOT_PASSWORD=minioadmin123",
            MINIO_IMAGE,
            "server",
            "/data",
        ],
        check=True,
        capture_output=True,
    )
    try:
        _wait_port("localhost", 9000)
        settings = Settings(
            secret_key="x" * 32,
            storage_backend="s3",
            s3_endpoint_url="http://localhost:9000",
            s3_bucket=BUCKET,
            s3_access_key="minioadmin",
            s3_secret_key="minioadmin123",
            s3_region="us-east-1",
        )
        storage = S3CompatibleStorage(settings)

        async def make_bucket() -> None:
            async with storage._client() as s3:
                try:
                    await s3.create_bucket(Bucket=BUCKET)
                except Exception as exc:
                    if "BucketAlreadyOwnedByYou" not in str(exc):
                        raise

        import asyncio

        asyncio.run(make_bucket())
        yield storage
    finally:
        subprocess.run(["docker", "rm", "-f", "fb-test-minio"], capture_output=True)


@pytest.mark.integration
@pytest.mark.slow
async def test_minio_roundtrip(minio_storage: S3CompatibleStorage) -> None:
    assert await minio_storage.exists(key="a.bin") is False
    await minio_storage.put(key="a.bin", data=b"\x00\x01")
    assert await minio_storage.exists(key="a.bin") is True
    assert await minio_storage.get(key="a.bin") == b"\x00\x01"
    url = await minio_storage.presigned_url(key="a.bin")
    assert url.startswith("http") and "a.bin" in url
    await minio_storage.delete(key="a.bin")
    assert await minio_storage.exists(key="a.bin") is False
