/* Canonical shadcn use-mobile hook (the animate-ui registry has no use-mobile
 * item of its own; Sidebar imports @/hooks/use-mobile). Breakpoint 768 aligns
 * with our md drawer cutoff (DESIGN.md §6). */

import * as React from 'react';

const MOBILE_BREAKPOINT = 768;

export function useIsMobile(): boolean {
  // Sync init (no undefined→false race: an early toggle must pick drawer vs rail).
  const [isMobile, setIsMobile] = React.useState<boolean>(() =>
    typeof window !== "undefined" && typeof window.matchMedia === "function"
      ? window.innerWidth < MOBILE_BREAKPOINT
      : false,
  );

  React.useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return;
    }
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    mql.addEventListener("change", onChange);
    onChange();
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return isMobile;
}
