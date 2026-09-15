// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";

import { LoginForm } from "@/components/login-form";

const login = vi.fn(async () => {});

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ login, sessionNotice: null, dismissNotice: () => {} }),
}));

afterEach(() => {
  cleanup();
  login.mockClear();
});

function renderForm() {
  return render(
    <MemoryRouter>
      <LoginForm />
    </MemoryRouter>,
  );
}

describe("LoginForm two-step", () => {
  it("rejects malformed email without advancing or calling login", () => {
    renderForm();
    // "a@b" passes native type=email validation but fails our format gate.
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "a@b" } });
    fireEvent.click(screen.getByRole("button", { name: /continue/i }));
    expect(screen.getByText(/valid email/i)).toBeTruthy();
    expect(screen.queryByLabelText(/password/i)).toBeNull();
    expect(login).not.toHaveBeenCalled();
  });

  it("always advances on valid email — registered or not", () => {
    renderForm();
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "Ghost@Example.com" } });
    fireEvent.click(screen.getByRole("button", { name: /continue/i }));
    expect(screen.getByLabelText(/password/i)).toBeTruthy();
    expect(screen.getByText("ghost@example.com")).toBeTruthy();
    expect(login).not.toHaveBeenCalled();
  });

  it("logs in with the normalized email on step 2", async () => {
    renderForm();
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "  Ada@Example.com " } });
    fireEvent.click(screen.getByRole("button", { name: /continue/i }));
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: "secret123" } });
    fireEvent.click(screen.getByRole("button", { name: /^login$/i }));
    expect(login).toHaveBeenCalledWith("ada@example.com", "secret123");
  });
});
