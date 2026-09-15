import { useCollection, type CollectionState } from "@/hooks/useCollection";
import { fetchAudit, type AuditRow } from "@/services/audit";

export function useAudit(activeOrgId: string | null): CollectionState<AuditRow> {
  return useCollection(
    () => (activeOrgId ? fetchAudit(activeOrgId) : Promise.resolve([])),
    [activeOrgId],
  );
}
