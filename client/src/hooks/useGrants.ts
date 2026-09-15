import { useCollection, type CollectionState } from "@/hooks/useCollection";
import { fetchGrants } from "@/services/grants";
import type { GrantRead } from "@/lib/api";

export function useGrants(activeOrgId: string | null): CollectionState<GrantRead> {
  return useCollection(
    () => (activeOrgId ? fetchGrants(activeOrgId) : Promise.resolve([])),
    [activeOrgId],
  );
}
