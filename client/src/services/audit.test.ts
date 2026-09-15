import { describe, expect, it } from "vitest";

import { normalizeAuditRow } from "@/services/audit";
import type { AuditRead } from "@/lib/api";

const base: AuditRead = {
  id: "a1",
  tenant_id: "t1",
  actor_user_id: "u1",
  action: "projects.create",
  resource_type: "project",
  resource_id: "p1",
  ip: null,
  created_at: "2026-01-01T00:00:00Z",
};

describe("normalizeAuditRow", () => {
  it("prefers metadata when present", () => {
    const row = normalizeAuditRow({ ...base, metadata: { k: 1 } });
    expect(row.metadata).toEqual({ k: 1 });
  });

  it("falls back to the audit_metadata alias", () => {
    const row = normalizeAuditRow({ ...base, audit_metadata: { k: 2 } });
    expect(row.metadata).toEqual({ k: 2 });
  });

  it("defaults to an empty object", () => {
    const row = normalizeAuditRow({ ...base });
    expect(row.metadata).toEqual({});
  });
});
