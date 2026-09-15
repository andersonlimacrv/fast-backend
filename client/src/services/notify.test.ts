// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ApiError } from "@/lib/api";
import { TOAST_LIMIT, TOAST_TIMEOUT_MS } from "@/lib/constants";
import { notify, toastManager, TOAST_PROVIDER } from "@/services/notify";

beforeEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

describe("notify facade", () => {
  it("sends each kind with its type", () => {
    const add = vi.spyOn(toastManager, "add").mockReturnValue("id");
    notify.success("ok");
    notify.info("note");
    notify.warning("careful");
    notify.error("broken");
    expect(add.mock.calls.map((c) => (c[0] as { type: string }).type)).toEqual([
      "success",
      "info",
      "warning",
      "error",
    ]);
  });

  it("confirm creates a persistent toast with an action", () => {
    const add = vi.spyOn(toastManager, "add").mockReturnValue("id");
    notify.confirm("Created", "description", { label: "Act", onClick: () => {} });
    const opts = add.mock.calls[0][0] as { timeout: number; actionProps: { children: string } };
    expect(opts.timeout).toBe(0);
    expect(opts.actionProps.children).toBe("Act");
  });

  it.each([
    [new ApiError(0, "down"), "Cannot reach backend"],
    [new ApiError(401, "nope"), "Unauthorized (401)"],
    [new ApiError(403, "nope"), "Forbidden (403)"],
    [new ApiError(404, "nope"), "Not found (404)"],
    [new ApiError(429, "slow"), "Rate limited (429)"],
    [new Error("weird"), "Unexpected error"],
  ])("maps %o to title %j", (err, title) => {
    const add = vi.spyOn(toastManager, "add").mockReturnValue("id");
    notify.fromError(err);
    const opts = add.mock.calls[0][0] as { title: string; type: string };
    expect(opts.title).toBe(title);
    expect(opts.type).toBe("error");
  });

  it("uses the documented provider defaults", () => {
    expect(TOAST_PROVIDER.limit).toBe(TOAST_LIMIT);
    expect(TOAST_PROVIDER.timeout).toBe(TOAST_TIMEOUT_MS);
    expect(TOAST_LIMIT).toBe(3);
    expect(TOAST_TIMEOUT_MS).toBe(5000);
  });
});
