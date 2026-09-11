"""Initial outbox table.

Revision ID: 0004_outbox
Revises: 0003_entitlements
"""

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects.postgresql import JSONB

revision = "0004_outbox"
down_revision = "0003_entitlements"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "outbox_messages",
        sa.Column("id", sa.String(32), primary_key=True),
        sa.Column("type", sa.String(120), nullable=False),
        sa.Column("aggregate_id", sa.String(64), nullable=True),
        sa.Column("idempotency_key", sa.String(128), nullable=False),
        sa.Column("payload", JSONB, nullable=False, server_default="{}"),
        sa.Column("status", sa.String(16), nullable=False, server_default="pending"),
        sa.Column("attempts", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("processed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("last_error", sa.Text(), nullable=True),
        sa.UniqueConstraint("idempotency_key", name="uq_outbox_idempotency_key"),
    )
    op.create_index("ix_outbox_messages_type", "outbox_messages", ["type"])
    op.create_index("ix_outbox_messages_status", "outbox_messages", ["status"])


def downgrade() -> None:
    op.drop_table("outbox_messages")
