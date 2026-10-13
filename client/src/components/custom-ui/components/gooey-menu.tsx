import * as React from "react";
import { AnimatePresence, motion, useReducedMotion, type Variants } from "motion/react";

import { Info } from "@/lib/icons";

/* Gooey menu: debug-overlay scope only (env/version/route inspector).
 * NOT a generic tooltip or menu — use ui/tooltip or Base UI Menu for those.
 * Trigger glyph: house `Info` (owner 2026-10-09 — the reference "N" artwork
 * is gone; the goo filter effect stays, kept for future use).
 *
 * Two layers (owner 2026-10-09): the goo filter blurs + re-contrasts its
 * input, so any crisp stroke/shadow INSIDE it smears and doubles ("two
 * stacked divs"). The filtered layer therefore carries silhouettes only
 * (borderless blobs); the real UI sits above, unfiltered, wearing the house
 * surface grammar (border/tokens; no shadow — owner).
 *
 * Blob fill (owner 2026-10-09): the silhouette must contrast with the page
 * in BOTH themes. `bg-muted` vanished in dark (0.2405 vs 0.1913 background,
 * ΔL 0.05; light was 0.8124 vs 1.0, ΔL 0.19). Current test: `bg-primary`
 * (0.8487, identical in light and dark; ΔL 0.15 light / 0.66 dark —
 * asymmetric, the owner is eyeballing it after chart-2's 0.37/0.44).
 * The 60% softness is `opacity` on the layer (post-filter): the goo color
 * matrix saturates alpha ≥ ~0.35, so 60% inside the filter renders opaque;
 * opacity afterwards keeps the requested softness. */

export interface GooeyMenuData {
  key: string;
  label: string;
  value: string;
  labelClass: string;
  valueClass: string;
}

export interface GooeyMenuProps {
  data?: GooeyMenuData[];
}

const DEFAULT_DATA: GooeyMenuData[] = [
  {
    key: "title",
    label: "fast-backend",
    value: "v1",
    labelClass: "text-sm font-medium text-muted-foreground",
    valueClass: "text-sm text-muted-foreground",
  },
  {
    key: "env",
    label: "Env",
    value: "dev",
    labelClass: "text-sm font-medium",
    valueClass: "rounded-md border border-border bg-muted px-2 py-0.5 font-mono text-sm text-muted-foreground",
  },
  {
    key: "route",
    label: "Route",
    value: "/admin",
    labelClass: "text-sm font-medium",
    valueClass: "text-sm text-muted-foreground",
  },
  {
    key: "errors",
    label: "Errors",
    value: "0",
    labelClass: "text-sm font-medium",
    valueClass:
      "flex items-center justify-center rounded-md border border-destructive/20 bg-destructive/10 px-2 py-0.5 font-mono text-sm text-destructive",
  },
];

const DIMENSIONS = { min: 40, max: 200 };

/** How far the panel lifts off the trigger when open (px). */
const OPEN_LIFT = 50;

const menuVariants: Variants = {
  closed: {
    y: 0,
    width: DIMENSIONS.min,
    height: DIMENSIONS.min,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30,
      y: { delay: 0.15 },
      width: { delay: 0 },
      height: { delay: 0 },
    },
  },
  open: {
    y: -OPEN_LIFT,
    width: DIMENSIONS.max,
    height: "auto",
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30,
      width: { delay: 0.15 },
      height: { delay: 0.15 },
    },
  },
};

function MenuRows({ data }: { data: GooeyMenuData[] }): React.ReactElement {
  return (
    <div className="grid w-[200px] space-y-2 p-4">
      {data.map((item) => (
        <div key={item.key} className="flex items-center justify-between text-foreground">
          <span className={item.labelClass}>{item.label}</span>
          <span className={item.valueClass}>{item.value}</span>
        </div>
      ))}
    </div>
  );
}

export function GooeyMenu({ data = DEFAULT_DATA }: GooeyMenuProps): React.ReactElement {
  const reduceMotion = useReducedMotion();
  const [isOpen, setIsOpen] = React.useState(false);

  React.useEffect(() => {
    if (!isOpen) return;
    function onKey(e: KeyboardEvent): void {
      if (e.key === "Escape") setIsOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen]);

  return (
    <div
      className="relative flex h-full min-h-125 w-full items-center justify-center bg-transparent"
      onMouseLeave={() => setIsOpen(false)}
    >
      {/* Goo filter defs (effect infrastructure, not an icon — the visible glyph is the Info icon). */}
      <svg aria-hidden="true" className="absolute bottom-0 left-0" version="1.1">
        <defs>
          <filter id="goo">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4.4" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -7"
              result="SkiperGooeyFilter"
            />
            <feBlend in="SourceGraphic" in2="goo" />
          </filter>
        </defs>
      </svg>

      <div className="relative size-10">
        {/* Blob layer (filtered): silhouette only — strokes/shadows inside the
            filter smear and double. The invisible clone keeps the blob's auto
            height tracking the real panel exactly. */}
        {!reduceMotion && (
          <div
            aria-hidden="true"
            style={{ filter: "url(#goo)" }}
            className="pointer-events-none absolute inset-0 opacity-60"
          >
            <div className="absolute top-0 left-0 size-10 rounded-lg bg-primary" />
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  key="goo-blob"
                  variants={menuVariants}
                  initial="closed"
                  animate="open"
                  exit="closed"
                  className="absolute bottom-0 left-0 overflow-hidden rounded-lg bg-primary"
                >
                  <div className="invisible">
                    <MenuRows data={data} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Crisp layer: the real UI, never filtered — house surface grammar
            (border/shadow/tokens). Fades in once the blob has expanded. */}
        <button
          type="button"
          aria-expanded={isOpen}
          aria-label={isOpen ? "Close debug overlay" : "Open debug overlay"}
          onMouseEnter={() => setIsOpen(true)}
          onClick={() => setIsOpen((v) => !v)}
          className="relative z-20 flex size-10 cursor-pointer items-center justify-center rounded-lg border border-border bg-muted text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
        >
          <Info className="size-5" aria-hidden="true" />
        </button>

        <AnimatePresence>
          {isOpen &&
            (reduceMotion ? (
              <div
                key="menu-content"
                role="status"
                aria-label="Debug overlay"
                style={{ bottom: OPEN_LIFT, width: DIMENSIONS.max }}
                className="absolute left-0 z-10 overflow-hidden rounded-lg border border-border bg-muted text-muted-foreground"
              >
                <MenuRows data={data} />
              </div>
            ) : (
              <motion.div
                key="menu-content"
                role="status"
                aria-label="Debug overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, transition: { duration: 0.1 } }}
                transition={{ duration: 0.16, delay: 0.25, ease: "easeOut" }}
                style={{ bottom: OPEN_LIFT, width: DIMENSIONS.max }}
                className="absolute left-0 z-10 overflow-hidden rounded-lg border border-border bg-muted text-muted-foreground"
              >
                <MenuRows data={data} />
              </motion.div>
            ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
