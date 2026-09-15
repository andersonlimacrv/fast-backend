/* Release metadata domain: normalization + offline fallback (both pure). */

import { getHealthz, getMeta } from "@/lib/api";
import type { MetaModule, MetaRead } from "@/lib/api";

export interface ModuleCard {
  key: string;
  title: string;
  blurb: string;
  enabled: boolean | null;
}

const DESCRIPTIONS: Record<string, { title: string; blurb: string }> = {
  identity: { title: "Identity", blurb: "Register, login, JWT + opaque refresh rotation, password recovery." },
  organization: { title: "Organizations", blurb: "Orgs, memberships and fixed owner/admin/member roles." },
  tenancy: { title: "Tenancy", blurb: "Row isolation with membership as authority, never the JWT alone." },
  entitlements: { title: "Entitlements", blurb: "Lightweight feature grants that work without billing." },
  projects: { title: "Projects", blurb: "Tenant-scoped example resource with role gates." },
  audit: { title: "Audit", blurb: "Append-only trail of sensitive actions with actor, IP and reason." },
  health: { title: "Health", blurb: "Liveness and readiness probes for deploys and dashboards." },
  admin: { title: "Admin", blurb: "Global control plane: users, orgs and cross-tenant reads (flag-gated)." },
  billing: { title: "Billing", blurb: "Stripe webhooks applied once as entitlement grants (flag-gated)." },
};

export const DEFAULT_META: MetaRead = { app: "fast-backend", version: "unknown", modules: [] };

/** Merge live modules with descriptions; unknown keys get a generic card (never break). */
export function normalizeMeta(meta: MetaRead): ModuleCard[] {
  const modules: MetaModule[] = Array.isArray(meta.modules) ? meta.modules : [];
  return modules.map((m) => {
    const known = DESCRIPTIONS[m.key];
    return {
      key: m.key,
      title: known?.title ?? m.key,
      blurb: known?.blurb ?? "Backend capability.",
      enabled: typeof m.enabled === "boolean" ? m.enabled : null,
    };
  });
}

export interface ReleaseInfo {
  meta: MetaRead;
  backendUp: boolean;
}

/** Live release info; any transport failure degrades to the static fallback. */
export async function fetchReleaseInfo(): Promise<ReleaseInfo> {
  try {
    const [meta] = await Promise.all([getMeta(), getHealthz()]);
    return { meta, backendUp: true };
  } catch {
    return { meta: DEFAULT_META, backendUp: false };
  }
}
