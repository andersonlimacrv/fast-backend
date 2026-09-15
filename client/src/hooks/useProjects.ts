import { useCollection, type CollectionState } from "@/hooks/useCollection";
import { fetchProjects } from "@/services/projects";
import type { ProjectRead } from "@/lib/api";

export function useProjects(activeOrgId: string | null = null): CollectionState<ProjectRead> {
  // The list endpoint is tenant-scoped server-side; reload when the active
  // organization changes.
  return useCollection(fetchProjects, [activeOrgId]);
}
