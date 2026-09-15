import { describe, expect, it } from "vitest";

import { normalizeEmail } from "@/services/login";

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
