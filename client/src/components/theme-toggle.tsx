import { motion, useReducedMotion } from "motion/react";
import { useState } from "react";

import { Moon, Sun } from "@/lib/icons";
import { applyTheme, isDarkTheme } from "@/external/theme";
import { cn } from "@/lib/utils";

/* Theme toggle: compact sun/moon pill ported from the SwitchMode reference
 * (token colors + external/theme.ts instead of next-themes + hex props).
 * Sizes default to a topbar-friendly pill; knob slides with a spring. */

export interface ThemeToggleProps {
  width?: number;
  height?: number;
  className?: string;
}

export function ThemeToggle({ width = 56, height = 28, className }: ThemeToggleProps) {
  // SPA-only (no SSR): reading the class at init is safe and avoids an effect.
  const [dark, setDark] = useState<boolean>(() => isDarkTheme());
  const reduceMotion = useReducedMotion();

  const iconSize = height * 0.5;
  const toggle = () => {
    setDark((d) => {
      applyTheme(!d);
      return !d;
    });
  };

  return (
    <motion.button
      type="button"
      role="switch"
      aria-checked={dark}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={toggle}
      style={{ width, height }}
      className={cn(
        "relative flex items-center rounded-full border border-border bg-background transition-colors",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
        className,
      )}
    >
      <motion.span
        layout={!reduceMotion}
        transition={{ type: "spring", stiffness: 500, damping: 32 }}
        style={{
          width: height - 4,
          height: height - 4,
          left: dark ? undefined : 2,
          right: dark ? 2 : undefined,
        }}
        className="absolute z-10 rounded-full bg-muted shadow-sm"
      />
      <span
        className="relative z-20 flex items-center justify-center"
        style={{ width: height, height: height - 4 }}
      >
        <Sun
          style={{ width: iconSize, height: iconSize }}
          className={dark ? "text-muted-foreground" : "text-foreground"}
          aria-hidden="true"
        />
      </span>
      <span
        className="relative z-20 flex items-center justify-center"
        style={{ width: height, height: height - 4 }}
      >
        <Moon
          style={{ width: iconSize, height: iconSize }}
          className={dark ? "text-foreground" : "text-muted-foreground"}
          aria-hidden="true"
        />
      </span>
    </motion.button>
  );
}
