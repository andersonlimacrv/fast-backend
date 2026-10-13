// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { RootBadge } from "@/components/admin/root-badge";

describe("root-badge", () => {
  it("renders the Root Mode card with crown and subtitle", () => {
    const { container } = render(<RootBadge />);
    expect(screen.getByText("Root Mode")).toBeTruthy();
    expect(screen.getByText("Full system access")).toBeTruthy();
    expect(container.querySelector('[data-slot="root-badge"]')).toBeTruthy();
    expect(container.querySelector("svg")).toBeTruthy();
  });

  it("renders the compact pill", () => {
    render(<RootBadge compact />);
    expect(screen.getByText("Root")).toBeTruthy();
  });
});
