"""Application settings (pydantic-settings). Env vars, never secrets in git."""

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    environment: str = "local"

    # --- Auth ---
    secret_key: str = "change-me-in-production-min-32-chars"  # noqa: S105 (dev default; prod via env)
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


@lru_cache
def get_settings() -> Settings:
    return Settings()
