// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { SocialButtons } from "@/components/auth/social-buttons";

const getMeta = vi.fn();

vi.mock("@/lib/api", () => ({
  getMeta: () => getMeta(),
}));

afterEach(() => {
  cleanup();
  getMeta.mockReset();
});

describe("SocialButtons", () => {
  it("renders the configured provider and starts the authorize URL", async () => {
    getMeta.mockResolvedValue({ social: { enabled: true, provider: "oidc", display_name: "Acme SSO" } });
    const onStart = vi.fn();
    render(<SocialButtons onStart={onStart} />);
    const button = await screen.findByRole("button", { name: /sign in with acme sso/i });
    button.click();
    expect(onStart).toHaveBeenCalledWith("http://localhost:8001/auth/social/oidc/authorize");
  });

  it("renders nothing when the backend flag is off", async () => {
    getMeta.mockResolvedValue({ social: { enabled: false, provider: null, display_name: null } });
    const { container } = render(<SocialButtons />);
    await waitFor(() => expect(getMeta).toHaveBeenCalled());
    await waitFor(() => expect(container.innerHTML).toBe(""));
  });
});
