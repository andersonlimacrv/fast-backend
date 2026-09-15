"""Social linked identities (change C, inert table).

Revision ID: 0008_social_identities
Revises: 0007_password_recovery
"""

import sqlalchemy as sa
from alembic import op

revision = "0008_social_identities"
down_revision = "0007_password_recovery"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "linked_identities",
        sa.Column("id", sa.String(32), primary_key=True),
        sa.Column("user_id", sa.String(32), nullable=False),
        sa.Column("provider", sa.String(40), nullable=False),
        sa.Column("provider_sub", sa.String(255), nullable=False),
        sa.Column("email", sa.String(320), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.UniqueConstraint("provider", "provider_sub", name="uq_linked_provider_sub"),
    )
    op.create_index("ix_linked_identities_user_id", "linked_identities", ["user_id"])


def downgrade() -> None:
    op.drop_index("ix_linked_identities_user_id", table_name="linked_identities")
    op.drop_table("linked_identities")
