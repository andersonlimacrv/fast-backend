// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";

import { SocialCallbackPage } from "@/pages/auth/SocialCallback";

const loginWithSocialCode = vi.fn(async () => {});

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ loginWithSocialCode }),
}));

afterEach(() => {
  cleanup();
  loginWithSocialCode.mockClear();
});

function renderAt(entry: string) {
  return render(
    <MemoryRouter initialEntries={[entry]}>
      <Routes>
        <Route path="/auth/social/callback" element={<SocialCallbackPage />} />
        <Route path="/~" element={<div>app-home</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("SocialCallbackPage", () => {
  it("exchanges the one-time code and enters the app", async () => {
    renderAt("/auth/social/callback?code=one-time-code");
    expect(await screen.findByText("app-home")).toBeTruthy();
    expect(loginWithSocialCode).toHaveBeenCalledWith("one-time-code");
  });

  it("shows the allowlisted error message without exchanging", async () => {
    renderAt("/auth/social/callback?social_error=state");
    expect(await screen.findByText(/expired or was already used/i)).toBeTruthy();
    expect(loginWithSocialCode).not.toHaveBeenCalled();
  });

  it("explains a callback without code", async () => {
    renderAt("/auth/social/callback");
    expect(await screen.findByText(/missing its one-time code/i)).toBeTruthy();
    expect(loginWithSocialCode).not.toHaveBeenCalled();
  });
});
