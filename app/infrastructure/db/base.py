"""Async database primitives (SQLAlchemy 2.0 + asyncpg)."""

from sqlalchemy.ext.asyncio import AsyncAttrs
from sqlalchemy.orm import DeclarativeBase


class Base(AsyncAttrs, DeclarativeBase):
    """Shared declarative base. All models inherit from here."""
