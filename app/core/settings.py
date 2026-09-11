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
        if self.environment == "production":
            if self.secret_key == DEV_DEFAULT_SECRET or len(self.secret_key) < 32:
                raise ValueError("production requires a real SECRET_KEY (>=32 chars)")
            if self.trusted_hosts == ["*"]:
                raise ValueError("production requires explicit TRUSTED_HOSTS")
        return self


@lru_cache
def get_settings() -> Settings:
    return Settings()
