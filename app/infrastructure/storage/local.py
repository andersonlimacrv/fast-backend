"""Local filesystem storage: zero-infra default. Keys are namespaced paths.

Traversal-safe: keys are resolved strictly inside the base directory.
"""

from pathlib import Path

from app.core.settings import Settings


class LocalFilesystemStorage:
    def __init__(self, settings: Settings) -> None:
        self._base = Path(settings.storage_dir).resolve()
        self._base.mkdir(parents=True, exist_ok=True)
        self._max_bytes = settings.storage_max_bytes

    def _resolve(self, key: str) -> Path:
        if not key or key.startswith("/") or ".." in Path(key).parts:
            raise ValueError(f"unsafe storage key: {key!r}")
        path = (self._base / key).resolve()
        if path != self._base and self._base not in path.parents:
            raise ValueError(f"unsafe storage key: {key!r}")
        return path

    async def put(self, *, key: str, data: bytes, content_type: str = "application/octet-stream") -> None:
        if len(data) > self._max_bytes:
            raise ValueError(f"object exceeds storage_max_bytes ({self._max_bytes})")
        path = self._resolve(key)
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(data)

    async def get(self, *, key: str) -> bytes:
        path = self._resolve(key)
        if not path.is_file():
            raise FileNotFoundError(key)
        return path.read_bytes()

    async def delete(self, *, key: str) -> None:
        path = self._resolve(key)
        if path.is_file():
            path.unlink()

    async def exists(self, *, key: str) -> bool:
        return self._resolve(key).is_file()

    async def presigned_url(self, *, key: str, expires_in: int = 3600) -> str:
        """Local has no signer: explicit file:// URL so callers never mistake it
        for a real presigned URL. Serve it yourself in dev only."""
        if not await self.exists(key=key):
            raise FileNotFoundError(key)
        return f"file://{self._resolve(key)}?expires_in={expires_in}"
