import { useCollection, type CollectionState } from "@/hooks/useCollection";
import { fetchOrgs } from "@/services/orgs";
import type { OrganizationRead } from "@/lib/api";

export function useOrgs(): CollectionState<OrganizationRead> {
  return useCollection(fetchOrgs);
}
