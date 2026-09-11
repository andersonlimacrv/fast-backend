"""Application settings (pydantic-settings). Env vars, never secrets in git."""

from functools import lru_cache
from typing import Any

from pydantic import model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

DEV_DEFAULT_SECRET = "change-me-in-production-min-32-chars"  # noqa: S105 (dev default; prod via env)


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    environment: str = "local"

    # --- Auth ---
    secret_key: str = DEV_DEFAULT_SECRET
    jwt_issuer: str = "fast-backend"
    jwt_audience: str = "fast-backend-api"
    access_token_ttl_minutes: int = 15
    refresh_token_ttl_days: int = 30

    # --- Hashing (Argon2id, calibrated for target hardware) ---
    argon2_time_cost: int = 3
    argon2_memory_cost: int = 65536
    argon2_parallelism: int = 1

    # --- Database ---
    database_url: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/fastbackend"
    db_pool_size: int = 5
    db_max_overflow: int = 10

    # --- Redis (throttling) ---
    redis_url: str = "redis://localhost:6379/0"

    # --- Throttling ---
    login_max_attempts: int = 10
    login_window_seconds: int = 60

    # --- Tenancy (Fase 1: single only; row enforced in Fase 3) ---
    tenancy_mode: str = "single"

    # --- Email ---
    email_backend: str = "log"  # log | smtp
    smtp_host: str = "localhost"
    smtp_port: int = 1025
    smtp_username: str = ""
    smtp_password: str = ""
    smtp_use_tls: bool = False
    smtp_from: str = "no-reply@example.com"

    # --- Storage ---
    storage_backend: str = "local"  # local | s3
    storage_dir: str = "./var/storage"
    storage_max_bytes: int = 10 * 1024 * 1024
    s3_endpoint_url: str = ""
    s3_bucket: str = "fastbackend"
    s3_access_key: str = ""
    s3_secret_key: str = ""
    s3_region: str = "us-east-1"

    # --- Jobs ---
    task_broker_url: str = "redis://localhost:6379/1"
    outbox_max_attempts: int = 5

    # --- Billing (Fase 7, opcional; default off) ---
    billing_enabled: bool = False
    stripe_webhook_secret: str = ""
    stripe_signature_tolerance: int = 300
    stripe_price_map: dict = {}

    # --- HTTP hardening ---
    trusted_hosts: list[str] = ["*"]
    cors_origins: list[str] = []

    @model_validator(mode="before")
    @classmethod
    def _split_csv_lists(cls, data: Any) -> Any:
        """Allow `CORS_ORIGINS=a,b` / `TRUSTED_HOSTS=a,b` besides JSON arrays."""
        if isinstance(data, dict):
            for field in ("cors_origins", "trusted_hosts"):
                value = data.get(field)
                if isinstance(value, str):
                    data[field] = [v.strip() for v in value.split(",") if v.strip()]
        return data

    @model_validator(mode="after")
    def _reject_insecure_production(self) -> "Settings":
        if self.tenancy_mode not in ("single", "row"):
            raise ValueError(f"unknown TENANCY_MODE: {self.tenancy_mode!r}")
        if self.email_backend not in ("log", "smtp"):
            raise ValueError(f"unknown EMAIL_BACKEND: {self.email_backend!r}")
        if self.storage_backend not in ("local", "s3"):
            raise ValueError(f"unknown STORAGE_BACKEND: {self.storage_backend!r}")
        if self.billing_enabled and not self.stripe_webhook_secret:
            raise ValueError("BILLING_ENABLED requires STRIPE_WEBHOOK_SECRET")
        if self.environment == "production":
            if self.secret_key == DEV_DEFAULT_SECRET or len(self.secret_key) < 32:
                raise ValueError("production requires a real SECRET_KEY (>=32 chars)")
            if self.trusted_hosts == ["*"]:
                raise ValueError("production requires explicit TRUSTED_HOSTS")
        return self


@lru_cache
def get_settings() -> Settings:
    return Settings()
