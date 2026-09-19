"""Application settings (pydantic-settings). Env vars, never secrets in git."""

from functools import lru_cache
from typing import Any

from pydantic import model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

DEV_DEFAULT_SECRET = "change-me-in-production-min-32-chars"  # noqa: S105 (dev default; prod via env)


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    environment: str = "local"

    # --- Release (change backend-release-meta; injected from git tag on release) ---
    app_version: str = "0.3.2"

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
    # --- Registration throttle (change rate-limit-global): per-IP failure
    # budget. Only duplicate (409) attempts consume it; 201 never does (NAT
    # with many legitimate signups must not lock out). Mass creation with
    # fresh emails is covered by the global ceiling below instead.
    register_max_attempts: int = 10
    register_window_seconds: int = 3600
    # --- Global per-IP ceiling (change rate-limit-global): anti-abuse only,
    # deliberately higher than auth budgets; every sensitive request counts.
    rate_limit_global_max_attempts: int = 300
    rate_limit_global_window_seconds: int = 60

    # --- Auth cookies + CSRF (change auth-cookies-http-only): session transport
    # for browser SPAs. Off by default (transition): flag off = current
    # header-only behavior, byte-identical. Flag on = dual read (header OR
    # cookie) + `Set-Cookie` on login/refresh/switch + CSRF synchronizer-token
    # on cookie-authenticated mutations. Sunset: header-only removal is a
    # dedicated follow-up change (no removal here); rollback = flag off.
    auth_cookie_enabled: bool = False
    # `Secure` requires HTTPS (see docs/DEPLOYMENT.md "Cookie sessions"): keep
    # true in staging/prod (Caddy terminates TLS); local dev over plain http
    # must set `AUTH_COOKIE_SECURE=false` or the browser will not send them.
    auth_cookie_secure: bool = True
    # `lax` (default) keeps top-level navigation working; `strict` is tighter
    # but drops the session on inbound top-level navigation. Never `none`
    # (would need cross-site CORS, outside the same-eTLD design).
    auth_cookie_samesite: str = "lax"
    # Optional cookie `Domain` (empty = host-only, the default).
    auth_cookie_domain: str = ""
    # CSRF synchronizer-token enforcement for cookie-authenticated mutations.
    # Kill-switch only (default on): production refuses cookies without it.
    csrf_enabled: bool = True

    # --- Tenancy (Fase 1: single only; row enforced in Fase 3) ---
    tenancy_mode: str = "single"

    # --- Admin control plane (change A; leaf module, flag-gated like billing) ---
    admin_enabled: bool = True
    bootstrap_key: str = ""

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

    # --- Password recovery (change B) ---
    # No default on purpose: every deploy (including local) must complete it.
    password_reset_ttl_minutes: int = 60
    frontend_url: str = ""

    # --- Social login (change C; contract only, no active provider) ---
    social_login_enabled: bool = False

    # --- HTTP hardening ---
    trusted_hosts: list[str] = ["*"]
    cors_origins: list[str] = []
    # Reverse-proxy trust (change proxy-hops-trusted): 0 = never honor X-Forwarded-For (fail-closed).
    trusted_proxy_hops: int = 0

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
        if self.trusted_proxy_hops < 0:
            raise ValueError("TRUSTED_PROXY_HOPS must be >= 0")
        if not 1 <= self.register_max_attempts <= 10000:
            raise ValueError("REGISTER_MAX_ATTEMPTS must be within 1..10000")
        if not 1 <= self.register_window_seconds <= 86400:
            raise ValueError("REGISTER_WINDOW_SECONDS must be within 1..86400")
        if not 1 <= self.rate_limit_global_max_attempts <= 100000:
            raise ValueError("RATE_LIMIT_GLOBAL_MAX_ATTEMPTS must be within 1..100000")
        if not 1 <= self.rate_limit_global_window_seconds <= 86400:
            raise ValueError("RATE_LIMIT_GLOBAL_WINDOW_SECONDS must be within 1..86400")
        if self.email_backend not in ("log", "smtp"):
            raise ValueError(f"unknown EMAIL_BACKEND: {self.email_backend!r}")
        if self.storage_backend not in ("local", "s3"):
            raise ValueError(f"unknown STORAGE_BACKEND: {self.storage_backend!r}")
        if self.billing_enabled and not self.stripe_webhook_secret:
            raise ValueError("BILLING_ENABLED requires STRIPE_WEBHOOK_SECRET")
        if self.bootstrap_key and len(self.bootstrap_key) < 32:
            raise ValueError("BOOTSTRAP_KEY must be empty or >=32 chars")
        if self.password_reset_ttl_minutes < 5 or self.password_reset_ttl_minutes > 24 * 60:
            raise ValueError("PASSWORD_RESET_TTL_MINUTES must be within 5..1440")
        if not self.app_version or not self.app_version.strip():
            raise ValueError("APP_VERSION must be non-empty")
        if not self.frontend_url or not self.frontend_url.strip():
            raise ValueError("FRONTEND_URL must be set (e.g. http://localhost:5173 for local dev)")
        if self.auth_cookie_samesite.lower() not in ("lax", "strict"):
            raise ValueError("AUTH_COOKIE_SAMESITE must be lax or strict (never none: same-eTLD design)")
        if self.environment == "production":
            if self.secret_key == DEV_DEFAULT_SECRET or len(self.secret_key) < 32:
                raise ValueError("production requires a real SECRET_KEY (>=32 chars)")
            if self.trusted_hosts == ["*"]:
                raise ValueError("production requires explicit TRUSTED_HOSTS")
            if "*" in self.cors_origins:
                raise ValueError("production requires explicit CORS_ORIGINS (never '*' with allow_credentials)")
            if not self.bootstrap_key or len(self.bootstrap_key) < 32:
                raise ValueError("production requires BOOTSTRAP_KEY (>=32 chars, root bootstrap audit)")
            if self.email_backend == "smtp" and not self.smtp_use_tls and self.smtp_host not in ("localhost", "127.0.0.1"):
                raise ValueError("production smtp to a remote host requires SMTP_USE_TLS=true")
            if not self.frontend_url.startswith("https://"):
                raise ValueError("production requires FRONTEND_URL https (reset links)")
            if self.auth_cookie_enabled and not self.auth_cookie_secure:
                raise ValueError("production cookies require AUTH_COOKIE_SECURE=true (HTTPS only)")
            if self.auth_cookie_enabled and not self.csrf_enabled:
                raise ValueError("production cookies require CSRF_ENABLED=true (synchronizer token)")
        return self


@lru_cache
def get_settings() -> Settings:
    return Settings()
