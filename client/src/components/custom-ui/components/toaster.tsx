import "goey-toast/styles.css";

import { useEffect, useState } from "react";
import { GooeyToaster } from "goey-toast";
import { useReducedMotion } from "motion/react";

/* Single mount point for all push notifications — render once at the app
 * root (change `notify-standard` S3: goey-toast behind the notify contract).
 * Site defaults kept: bottom-right, spring/bounce, Escape, swipe, timestamp.
 * House wiring: `theme` follows the `.dark` class (imperative toggle, so a
 * MutationObserver keeps it reactive), stack capped by native `maxQueue={3}`,
 * and spring obeys reduced-motion (DESIGN.md §7.2 — belt over the lib's own
 * media query). */
function useDarkTheme(): boolean {
  const [dark, setDark] = useState<boolean>(
    () => typeof document !== "undefined" && document.documentElement.classList.contains("dark"),
  );
  useEffect(() => {
    const observer = new MutationObserver(() =>
      setDark(document.documentElement.classList.contains("dark")),
    );
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);
  return dark;
}

export function AppToaster() {
  const dark = useDarkTheme();
  const reduceMotion = useReducedMotion();
  return <GooeyToaster position="bottom-right" theme={dark ? "dark" : "light"} spring={!reduceMotion} maxQueue={3} />;
}
