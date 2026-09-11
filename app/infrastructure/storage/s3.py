"""S3-compatible storage: MinIO (VPS), AWS S3, R2 and B2 via `endpoint_url`.

One adapter for every S3 dialect; only credentials/endpoint change.
"""

import io

import aioboto3

from app.core.settings import Settings


class S3CompatibleStorage:
    def __init__(self, settings: Settings) -> None:
        if not settings.s3_access_key or not settings.s3_secret_key:
            raise ValueError("s3 backend requires S3_ACCESS_KEY and S3_SECRET_KEY")
        self._settings = settings
        self._session = aioboto3.Session(
            aws_access_key_id=settings.s3_access_key,
            aws_secret_access_key=settings.s3_secret_key,
            region_name=settings.s3_region,
        )

    def _client(self):
        kwargs: dict = {}
        if self._settings.s3_endpoint_url:
            kwargs["endpoint_url"] = self._settings.s3_endpoint_url
        return self._session.client("s3", **kwargs)

    async def put(self, *, key: str, data: bytes, content_type: str = "application/octet-stream") -> None:
        if len(data) > self._settings.storage_max_bytes:
            raise ValueError(f"object exceeds storage_max_bytes ({self._settings.storage_max_bytes})")
        async with self._client() as s3:
            await s3.put_object(Bucket=self._settings.s3_bucket, Key=key, Body=io.BytesIO(data), ContentType=content_type)

    async def get(self, *, key: str) -> bytes:
        from botocore.exceptions import ClientError

        async with self._client() as s3:
            try:
                response = await s3.get_object(Bucket=self._settings.s3_bucket, Key=key)
            except ClientError as exc:
                if exc.response.get("Error", {}).get("Code") == "NoSuchKey":
                    raise FileNotFoundError(key) from exc
                raise
            async with response["Body"] as stream:
                data = await stream.read()
                assert isinstance(data, bytes)
                return data

    async def delete(self, *, key: str) -> None:
        async with self._client() as s3:
            await s3.delete_object(Bucket=self._settings.s3_bucket, Key=key)

    async def exists(self, *, key: str) -> bool:
        from botocore.exceptions import ClientError

        async with self._client() as s3:
            try:
                await s3.head_object(Bucket=self._settings.s3_bucket, Key=key)
                return True
            except ClientError as exc:
                if exc.response.get("Error", {}).get("Code") in ("404", "NoSuchKey", "NotFound"):
                    return False
                raise

    async def presigned_url(self, *, key: str, expires_in: int = 3600) -> str:
        async with self._client() as s3:
            url = await s3.generate_presigned_url(
                "get_object",
                Params={"Bucket": self._settings.s3_bucket, "Key": key},
                ExpiresIn=expires_in,
            )
            assert isinstance(url, str)
            return url
