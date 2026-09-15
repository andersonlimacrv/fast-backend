/* Organization domain: thin, stable signatures over the transport. */

import { createOrg, listOrgs } from "@/lib/api";
import type { OrganizationRead } from "@/lib/api";

export async function fetchOrgs(): Promise<OrganizationRead[]> {
  return listOrgs();
}

export async function createOrganization(name: string): Promise<OrganizationRead> {
  return createOrg(name.trim());
}
