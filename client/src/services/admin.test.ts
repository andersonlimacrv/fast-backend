import { describe, expect, it } from "vitest";

import {
  accessLevelOf,
  adminMembershipSchema,
  canDo,
  CAPABILITY_MATRIX,
  capabilitiesFor,
  createUserSchema,
  isRoot,
  isStaff,
  normalizeReason,
  REASON_MIN_LENGTH,
} from "@/services/admin";

describe("normalizeReason", () => {
  it.each([
    ["", null],
    ["   ", null],
    ["short", null],
    ["1234567", null],
    ["12345678", "12345678"],
    ["  revoke leaked session  ", "revoke leaked session"],
  ])("maps %j to %j", (input, expected) => {
    expect(normalizeReason(input)).toBe(expected);
  });

  it("matches the backend minimum", () => {
    expect(REASON_MIN_LENGTH).toBe(8);
  });
});

describe("isStaff / isRoot", () => {
  it("root implies staff", () => {
    expect(isRoot({ is_superuser: true })).toBe(true);
    expect(isStaff({ is_superuser: true })).toBe(true);
    expect(isStaff({ is_superuser: true, is_staff: false })).toBe(true);
  });

  it("staff without root passes staff only", () => {
    expect(isRoot({ is_superuser: false })).toBe(false);
    expect(isStaff({ is_superuser: false, is_staff: true })).toBe(true);
  });

  it("plain and missing users fail both", () => {
    expect(isStaff({ is_superuser: false })).toBe(false);
    expect(isStaff({ is_superuser: false, is_staff: false })).toBe(false);
    expect(isStaff(null)).toBe(false);
    expect(isStaff(undefined)).toBe(false);
    expect(isRoot(null)).toBe(false);
  });
});

describe("access levels (mirror of policies.py)", () => {
  it("resolves root > staff > member", () => {
    expect(accessLevelOf({ is_superuser: true })).toBe("root");
    expect(accessLevelOf({ is_superuser: true, is_staff: false })).toBe("root");
    expect(accessLevelOf({ is_superuser: false, is_staff: true })).toBe("staff");
    expect(accessLevelOf({ is_superuser: false })).toBe("member");
    expect(accessLevelOf(null)).toBe("member");
  });

  it("only root manages staff", () => {
    expect(canDo("root", "staff-grant")).toBe(true);
    expect(canDo("staff", "staff-grant")).toBe(false);
    expect(canDo("member", "staff-grant")).toBe(false);
    expect(canDo("root", "nope")).toBe(false);
  });

  it("staff shares everything else with root", () => {
    for (const row of CAPABILITY_MATRIX) {
      if (row.key === "staff-grant") continue;
      expect(row.staff).toBe(true);
      expect(row.root).toBe(true);
    }
    expect(CAPABILITY_MATRIX.every((r) => !r.member)).toBe(true);
  });

  it("capabilitiesFor returns only the allowed rows", () => {
    expect(capabilitiesFor("root").map((r) => r.key)).toHaveLength(5);
    expect(capabilitiesFor("staff").map((r) => r.key)).toEqual(
      expect.not.arrayContaining(["staff-grant"]),
    );
    expect(capabilitiesFor("member")).toEqual([]);
  });
});

describe("admin schemas", () => {
  it("createUser mirrors backend bounds (email, password 8..256, reason 8..500)", () => {
    const ok = createUserSchema.safeParse({ email: "a@b.c", password: "long-enough!", reason: "needs access" });
    expect(ok.success).toBe(true);
    expect(createUserSchema.safeParse({ email: "nope", password: "long-enough!", reason: "needs access" }).success).toBe(
      false,
    );
    expect(createUserSchema.safeParse({ email: "a@b.c", password: "short", reason: "needs access" }).success).toBe(
      false,
    );
    expect(createUserSchema.safeParse({ email: "a@b.c", password: "long-enough!", reason: "short" }).success).toBe(
      false,
    );
  });

  it("membership requires org, user, fixed role and reason", () => {
    const ok = adminMembershipSchema.safeParse({ orgId: "o1", userId: "u1", role: "admin", reason: "needs access" });
    expect(ok.success).toBe(true);
    expect(
      adminMembershipSchema.safeParse({ orgId: "", userId: "u1", role: "admin", reason: "needs access" }).success,
    ).toBe(false);
    expect(
      adminMembershipSchema.safeParse({ orgId: "o1", userId: "u1", role: "ownerX", reason: "needs access" }).success,
    ).toBe(false);
  });
});
