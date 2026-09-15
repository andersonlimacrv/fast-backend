// @vitest-environment jsdom
import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useAsync } from "@/hooks/useAsync";

describe("useAsync", () => {
  it("transitions loading -> data", async () => {
    const { result } = renderHook(() => useAsync(async () => "ok"));
    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toBe("ok");
    expect(result.current.error).toBeNull();
  });

  it("transitions loading -> error", async () => {
    const boom = new Error("boom");
    const { result } = renderHook(() =>
      useAsync(async () => {
        throw boom;
      }),
    );
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe(boom);
    expect(result.current.data).toBeNull();
  });

  it("reload re-executes the fetcher", async () => {
    const fetcher = vi.fn(async () => "v");
    const { result } = renderHook(() => useAsync(fetcher));
    await waitFor(() => expect(result.current.loading).toBe(false));
    await act(async () => {
      await result.current.reload();
    });
    expect(fetcher).toHaveBeenCalledTimes(2);
  });
});
