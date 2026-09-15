/* Grant domain: owns the form-level limit parsing (was inline in GrantsPage). */

import { listGrants, upsertGrant } from "@/lib/api";
import type { GrantRead } from "@/lib/api";

/** Empty/blank/invalid input means "no limit" (null); otherwise a floor of >= 0. */
export function parseGrantLimit(raw: string): number | null {
  const trimmed = raw.trim();
  if (trimmed === "") return null;
  const parsed = Number(trimmed);
  if (Number.isNaN(parsed)) return null;
  return Math.max(0, Math.floor(parsed));
}

export async function fetchGrants(orgId: string): Promise<GrantRead[]> {
  return listGrants(orgId);
}

export async function saveGrant(
  orgId: string,
  key: string,
  limitInput: string,
  enabled: boolean,
): Promise<GrantRead> {
  return upsertGrant(orgId, key.trim(), parseGrantLimit(limitInput), enabled);
}
