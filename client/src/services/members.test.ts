import { describe, expect, it } from "vitest";

import { inviteMemberSchema } from "@/services/members";

describe("inviteMemberSchema", () => {
  it("accepts a trimmed user id with a fixed role", () => {
    expect(inviteMemberSchema.parse({ userId: "  uid-1 ", role: "member" })).toEqual({
      userId: "uid-1",
      role: "member",
    });
  });

  it("rejects blank user id and unknown roles", () => {
    expect(inviteMemberSchema.safeParse({ userId: "  ", role: "member" }).success).toBe(false);
    expect(inviteMemberSchema.safeParse({ userId: "uid-1", role: "superadmin" }).success).toBe(false);
  });
});
