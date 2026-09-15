import { describe, expect, it } from "vitest";

import { grantSchema, parseGrantLimit } from "@/services/grants";

describe("parseGrantLimit", () => {
  it.each([
    ["", null],
    ["   ", null],
    ["10", 10],
    [" 7 ", 7],
    ["abc", null],
    ["10.9", 10],
    ["-3", 0],
    ["0", 0],
  ])("maps %j to %j", (input, expected) => {
    expect(parseGrantLimit(input)).toBe(expected);
  });
});

describe("grantSchema", () => {
  it("trims the key and keeps raw limit input for parseGrantLimit", () => {
    expect(grantSchema.parse({ key: "  projects.max ", limitInput: "10", enabled: true })).toEqual({
      key: "projects.max",
      limitInput: "10",
      enabled: true,
    });
  });

  it("rejects a blank key", () => {
    expect(grantSchema.safeParse({ key: "  ", limitInput: "", enabled: false }).success).toBe(false);
  });
});
