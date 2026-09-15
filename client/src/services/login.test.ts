import { describe, expect, it } from "vitest";

import { loginEmailSchema, loginPasswordSchema, normalizeEmail, registerSchema } from "@/services/login";

describe("normalizeEmail", () => {
  it.each([
    ["", null],
    ["   ", null],
    ["not-an-email", null],
    ["a@b", null],
    ["a@b.c", "a@b.c"],
    ["  Ada@Example.COM  ", "ada@example.com"],
    ["x@y .z", null],
  ])("maps %j to %j", (input, expected) => {
    expect(normalizeEmail(input)).toBe(expected);
  });
});

describe("login schemas", () => {
  it("accepts and normalizes a valid email", () => {
    expect(loginEmailSchema.parse({ email: "  Ada@Example.com " })).toEqual({ email: "ada@example.com" });
  });

  it("rejects malformed email and empty password", () => {
    expect(loginEmailSchema.safeParse({ email: "a@b" }).success).toBe(false);
    expect(loginPasswordSchema.safeParse({ password: "" }).success).toBe(false);
    expect(loginPasswordSchema.safeParse({ password: "x" }).success).toBe(true);
  });

  it("register enforces backend password bounds", () => {
    expect(registerSchema.safeParse({ email: "a@b.c", password: "short" }).success).toBe(false);
    expect(registerSchema.safeParse({ email: "a@b.c", password: "long-enough!" }).success).toBe(true);
  });
});
