"""Entitlement grants.

Revision ID: 0003_entitlements
Revises: 0002_organization_tenancy
"""

import sqlalchemy as sa
from alembic import op

revision = "0003_entitlements"
down_revision = "0002_organization_tenancy"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "entitlement_grants",
        sa.Column("id", sa.String(32), primary_key=True),
        sa.Column("org_id", sa.String(32), nullable=False),
        sa.Column("key", sa.String(120), nullable=False),
        sa.Column("limit", sa.Integer(), nullable=True),
        sa.Column("enabled", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["org_id"], ["organizations.id"], ondelete="CASCADE"),
        sa.UniqueConstraint("org_id", "key", name="uq_grant_org_key"),
    )
    op.create_index("ix_entitlement_grants_org_id", "entitlement_grants", ["org_id"])


def downgrade() -> None:
    op.drop_table("entitlement_grants")
