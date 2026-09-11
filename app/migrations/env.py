"""Alembic environment: async engine from settings, metadata from app models."""

import asyncio
from logging.config import fileConfig

from alembic import context
from sqlalchemy.ext.asyncio import create_async_engine

# Import models so metadata is populated.
import app.infrastructure.auth.refresh_tokens  # noqa: F401
import app.modules.identity.models  # noqa: F401
import app.modules.organization.models  # noqa: F401
import app.modules.projects.models  # noqa: F401
from app.core.settings import Settings
from app.infrastructure.db.base import Base

config = context.config
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata

settings = Settings()


def run_migrations_offline() -> None:
    context.configure(
        url=settings.database_url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    engine = create_async_engine(settings.database_url, pool_pre_ping=True)

    async def run() -> None:
        async with engine.connect() as connection:
            await connection.run_sync(do_run_migrations)
        await engine.dispose()

    def do_run_migrations(connection) -> None:
        context.configure(connection=connection, target_metadata=target_metadata)
        with context.begin_transaction():
            context.run_migrations()

    asyncio.run(run())


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
