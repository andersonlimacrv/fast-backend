// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ApiError } from "@/lib/api";
import { TOAST_LIMIT, TOAST_TIMEOUT_MS } from "@/lib/constants";
import { notify } from "@/services/notify";
import { TOAST_PROVIDER } from "@/services/notify.provider";

vi.mock("goey-toast", () => ({
  GooeyToaster: () => null,
  gooeyToast: {
    success: vi.fn(() => "id"),
    info: vi.fn(() => "id"),
    warning: vi.fn(() => "id"),
    error: vi.fn(() => "id"),
    promise: vi.fn((_task: unknown, _data: unknown) => "id"),
    dismiss: vi.fn(),
    update: vi.fn(),
  },
}));

import { gooeyToast } from "goey-toast";

beforeEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

describe("notify facade", () => {
  it("sends each kind with house icons and policy durations", () => {
    notify.success("ok");
    notify.info("note");
    notify.warning("careful");
    notify.error("broken");
    expect(gooeyToast.success).toHaveBeenCalledWith(
      "ok",
      expect.objectContaining({ duration: TOAST_TIMEOUT_MS }),
    );
    expect(gooeyToast.info).toHaveBeenCalledWith(
      "note",
      expect.objectContaining({ duration: TOAST_TIMEOUT_MS }),
    );
    expect(gooeyToast.warning).toHaveBeenCalledWith(
      "careful",
      expect.objectContaining({ duration: TOAST_TIMEOUT_MS }),
    );
    expect(gooeyToast.error).toHaveBeenCalledWith(
      "broken",
      expect.objectContaining({ duration: 7000 }),
    );
    const icon = (gooeyToast.success as ReturnType<typeof vi.fn>).mock.calls[0][1].icon;
    expect(icon).toBeTruthy();
  });

  it.each([
    [new ApiError(0, "down"), "Cannot reach backend"],
    [new ApiError(401, "nope"), "Unauthorized (401)"],
    [new ApiError(403, "nope"), "Forbidden (403)"],
    [new ApiError(404, "nope"), "Not found (404)"],
    [new ApiError(429, "slow"), "Rate limited (429)"],
    [new Error("weird"), "Unexpected error"],
  ])("maps %o to title %j", (err, title) => {
    notify.fromError(err);
    expect(gooeyToast.error).toHaveBeenCalledWith(
      title,
      expect.objectContaining({ duration: 7000 }),
    );
  });

  it("uses the documented provider defaults", () => {
    expect(TOAST_PROVIDER.limit).toBe(TOAST_LIMIT);
    expect(TOAST_PROVIDER.timeout).toBe(TOAST_TIMEOUT_MS);
    expect(TOAST_LIMIT).toBe(3);
    expect(TOAST_TIMEOUT_MS).toBe(5000);
  });

  it("promise maps rejection through friendlyError", async () => {
    const task = Promise.reject(new ApiError(0, "down"));
    const pending = notify.promise(task, {
      loading: "Saving",
      success: "Saved",
      error: "Save failed",
    });
    await expect(pending).rejects.toThrow();
    expect(gooeyToast.promise).toHaveBeenCalledWith(
      task,
      expect.objectContaining({ loading: "Saving", success: "Saved", error: "Save failed" }),
    );
    const data = (gooeyToast.promise as ReturnType<typeof vi.fn>).mock.calls[0][1] as {
      description: { error: (err: unknown) => string };
    };
    expect(data.description.error(new ApiError(0, "down"))).toBe("down");
  });

  it("close dismisses by id", () => {
    notify.close("abc");
    expect(gooeyToast.dismiss).toHaveBeenCalledWith("abc");
  });
});
