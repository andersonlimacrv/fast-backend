/* Project domain: thin, stable signatures over the transport. */

import { createProject, deleteProject, listProjects, renameProject } from "@/lib/api";
import type { ProjectRead } from "@/lib/api";

export async function fetchProjects(): Promise<ProjectRead[]> {
  return listProjects();
}

export async function createNewProject(name: string): Promise<ProjectRead> {
  return createProject(name.trim());
}

export async function renameExistingProject(id: string, name: string): Promise<ProjectRead> {
  return renameProject(id, name.trim());
}

export async function removeProject(id: string): Promise<void> {
  await deleteProject(id);
}
