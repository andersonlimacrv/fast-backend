"""Admin control plane base: global staff flag + single-root guard.

Revision ID: 0006_admin_staff
Revises: 0005_audit
"""

import sqlalchemy as sa
from alembic import op

revision = "0006_admin_staff"
down_revision = "0005_audit"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("users", sa.Column("is_staff", sa.Boolean(), nullable=False, server_default=sa.false()))
    # Invariant: superuser implies staff (change A, ADR 0005).
    op.create_check_constraint("ck_users_superuser_implies_staff", "users", "NOT is_superuser OR is_staff")
    # Structural single root (defense in depth; service also refuses a second root).
    op.execute("CREATE UNIQUE INDEX uq_single_root ON users ((1)) WHERE is_superuser")


def downgrade() -> None:
    op.execute("DROP INDEX IF EXISTS uq_single_root")
    op.drop_constraint("ck_users_superuser_implies_staff", "users", type_="check")
    op.drop_column("users", "is_staff")
