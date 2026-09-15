import { describe, expect, it } from "vitest";

import { DEFAULT_META, normalizeMeta } from "@/services/meta";

describe("normalizeMeta", () => {
  it("maps known modules with descriptions and flags", () => {
    const cards = normalizeMeta({
      app: "fast-backend",
      version: "0.1.0",
      modules: [
        { key: "identity", enabled: true },
        { key: "billing", enabled: false },
      ],
    });
    expect(cards).toEqual([
      { key: "identity", title: "Identity", blurb: expect.any(String), enabled: true },
      { key: "billing", title: "Billing", blurb: expect.any(String), enabled: false },
    ]);
  });

  it("never breaks on unknown keys or malformed modules", () => {
    expect(normalizeMeta({ app: "x", version: "y", modules: [{ key: "future", enabled: true }] })[0].title).toBe(
      "future",
    );
    expect(normalizeMeta({ app: "x", version: "y", modules: "nope" as never })).toEqual([]);
  });
});

describe("DEFAULT_META", () => {
  it("ships a static offline fallback (live path covered by visual acceptance)", () => {
    expect(DEFAULT_META.version).toBe("unknown");
    expect(DEFAULT_META.modules).toEqual([]);
  });
});
