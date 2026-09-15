import { describe, expect, it } from "vitest";

import { parseGrantLimit } from "@/services/grants";

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
