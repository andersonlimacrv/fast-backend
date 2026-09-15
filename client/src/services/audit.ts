/* Audit domain: normalizes the backend's metadata alias.
 *
 * The API serializes the field as `audit_metadata` (Pydantic alias); older or
 * hand-built payloads may carry `metadata`. Consumers always read `.metadata.
 */

import { listAudit } from "@/lib/api";
import type { AuditRead } from "@/lib/api";

export interface AuditRow extends Omit<AuditRead, "metadata" | "audit_metadata"> {
  metadata: Record<string, unknown>;
}

export function normalizeAuditRow(row: AuditRead): AuditRow {
  const { metadata, audit_metadata, ...rest } = row;
  return { ...rest, metadata: metadata ?? audit_metadata ?? {} };
}

export async function fetchAudit(orgId: string): Promise<AuditRow[]> {
  return (await listAudit(orgId)).map(normalizeAuditRow);
}
