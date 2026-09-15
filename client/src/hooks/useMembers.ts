import { useCollection, type CollectionState } from "@/hooks/useCollection";
import { fetchMembers } from "@/services/members";
import type { MembershipRead } from "@/lib/api";

export function useMembers(activeOrgId: string | null): CollectionState<MembershipRead> {
  return useCollection(
    () => (activeOrgId ? fetchMembers(activeOrgId) : Promise.resolve([])),
    [activeOrgId],
  );
}
