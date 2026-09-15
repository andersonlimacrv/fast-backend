// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { KpiCard } from "@/components/ui/kpi-card";

afterEach(() => {
  cleanup();
});

describe("KpiCard", () => {
  it("renders value with tabular numerals and delta with icon, not color alone", () => {
    render(<KpiCard label="Users" value="128" delta={-4} />);
    expect(screen.getByText("128").className).toMatch(/tabular-nums/);
    expect(screen.getByLabelText(/down 4 percent/i)).toBeTruthy();
  });

  it("omits delta chrome when no delta", () => {
    render(<KpiCard label="Projects" value="7" />);
    expect(screen.queryByLabelText(/percent/i)).toBeNull();
  });
});
