import * as React from "react";
import { AnimatePresence, motion, useReducedMotion, type Variants } from "motion/react";

import { GooGlyph } from "@/lib/icons";

/* Gooey menu: debug-overlay scope only (env/version/route inspector).
 * NOT a generic tooltip or menu — use ui/tooltip or Base UI Menu for those. */

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

const menuVariants: Variants = {
  closed: {
    y: 0,
    borderRadius: 8,
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
    y: -50,
    borderRadius: 8,
    width: DIMENSIONS.max,
    height: "auto",
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30,
      width: { delay: 0.15 },
      height: { delay: 0.15 },
      borderRadius: { delay: 0.15 },
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
      {/* Goo filter defs (effect infrastructure, not an icon — the visible glyph is GooGlyph). */}
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

      <div style={{ filter: "url(#goo)" }} className="absolute">
        <button
          type="button"
          aria-expanded={isOpen}
          aria-label={isOpen ? "Close debug overlay" : "Open debug overlay"}
          onMouseEnter={() => setIsOpen(true)}
          onClick={() => setIsOpen((v) => !v)}
          className="relative z-20 flex size-10 cursor-pointer items-center justify-center rounded-lg border border-border bg-muted text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
        >
          <GooGlyph className="size-8" />
        </button>

        <AnimatePresence>
          {isOpen &&
            (reduceMotion ? (
              <div
                key="menu-content"
                role="status"
                aria-label="Debug overlay"
                className="absolute bottom-0 overflow-hidden rounded-lg bg-muted text-muted-foreground"
              >
                <MenuRows data={data} />
              </div>
            ) : (
              <motion.div
                key="menu-content"
                role="status"
                aria-label="Debug overlay"
                variants={menuVariants}
                initial="closed"
                animate="open"
                exit="closed"
                className="absolute bottom-0 overflow-hidden rounded-lg bg-muted text-muted-foreground"
              >
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, transition: { duration: 0.1 } }}
                  transition={{ duration: 0.2, delay: 0.15 }}
                >
                  <MenuRows data={data} />
                </motion.div>
              </motion.div>
            ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
