"""ObjectStorage port. Local now; S3-compatible (MinIO/S3/R2) behind the same API."""

from typing import Protocol


class ObjectStorage(Protocol):
    async def put(self, *, key: str, data: bytes, content_type: str = "application/octet-stream") -> None: ...

    async def get(self, *, key: str) -> bytes:
        """Raises `FileNotFoundError` when the key does not exist."""
        ...

    async def delete(self, *, key: str) -> None:
        """Idempotent: missing keys are a no-op."""
        ...

    async def exists(self, *, key: str) -> bool: ...

    async def presigned_url(self, *, key: str, expires_in: int = 3600) -> str:
        """Time-limited direct-access URL. Local strategy is explicit, not magic."""
        ...
