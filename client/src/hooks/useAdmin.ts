import { useAsync } from "@/hooks/useAsync";
import { useCollection, type CollectionState } from "@/hooks/useCollection";
import {
  fetchAdminAudit,
  fetchAdminOrgs,
  fetchAdminOverview,
  fetchAdminUsers,
} from "@/services/admin";
import type { AdminOrgRead, AdminOverview, AdminUserRead } from "@/lib/api";
import type { AuditRow } from "@/services/audit";

export function useAdminOverview() {
  return useAsync<AdminOverview>(() => fetchAdminOverview(), []);
}

export function useAdminUsers(): CollectionState<AdminUserRead> {
  return useCollection(() => fetchAdminUsers(), []);
}

export function useAdminOrgs(): CollectionState<AdminOrgRead> {
  return useCollection(() => fetchAdminOrgs(), []);
}

export function useAdminAudit(): CollectionState<AuditRow> {
  return useCollection(() => fetchAdminAudit(), []);
}
