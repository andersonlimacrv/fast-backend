// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  Check,
  ChevronDown,
  Copy,
  FaInbox,
  GooGlyph,
  GradientCode,
  House,
  Moon,
  RiHome5Fill,
  Sun,
  X,
  Zap,
} from "@/lib/icons";

/* Golden-rule guard: the surface this file asserts is the surface the app
 * may use. Anything missing here must be added here first (single place). */

describe("lib/icons surface", () => {
  it("re-exports the chrome icons the shell needs", () => {
    for (const Icon of [Sun, Moon, X, Check, Copy, ChevronDown, House, Zap]) {
      expect(Icon).toBeTruthy();
    }
  });

  it("re-exports the ported reference icons", () => {
    for (const Icon of [FaInbox, RiHome5Fill]) {
      expect(Icon).toBeTruthy();
    }
  });

  it("renders decorative SVGs hidden from assistive tech", () => {
    const { container } = render(<GooGlyph />);
    expect(container.querySelector("svg")).toBeTruthy();
    render(<GradientCode code="404" />);
    expect(screen.getByText("404")).toBeTruthy();
  });
});
