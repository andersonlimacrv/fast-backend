/* ExpandDetails — collapsible details card ported from the standalone
 * `ExpandDetails.md` reference (item 11, change `custom-ui-expand-details`).
 *
 * Choreography kept from the doc, minus the corners: the card animates width
 * (320↔120) and height (measured from the content) on a spring (200/22/1.2),
 * with the delays inverted on purpose — collapsing shrinks the width first
 * (height waits 0.25s) and expanding grows the height first (width waits
 * 0.3s); the chevron rotates -90° (0.2s, 0.3s delay) and the panel
 * enters/leaves with an 8px blur + y (0.4s spring, `popLayout`, 0.3s delay).
 *
 * The doc also animated borderRadius (20↔24, an open→pill morph). Dropped by
 * the owner (2026-09-23): the card is just a div that alternates size, and the
 * corners come from the theme — `rounded-xl` resolves `var(--radius-xl)`
 * straight from index.css (4px today, same as the CreditUsageCard), so no
 * hardcoded radii and no JS.
 *
 * Local deltas: the doc's `react-use-measure` is a phantom dependency (imported
 * but never listed in its install block — review-design §7), so the content is
 * measured with a tiny local ResizeObserver (fallback `height: auto` while the
 * first measure lands, guard for environments without RO). The `zinc` variant
 * is dropped for the token palette the doc's own `-base` variant already used,
 * the demo's `h-screen` stage stays out (the proof centers it), the content is
 * data-driven (`items`) and the toggle gets `aria-expanded` + our `ring-2`
 * focus (DESIGN.md §8). Prefers-reduced-motion collapses every animation. */

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import * as React from "react";

import { ChevronDown } from "@/lib/icons";
import { cn } from "@/lib/utils";

const SPRING_CONFIG = {
  type: "spring",
  stiffness: 200,
  damping: 22,
  mass: 1.2,
} as const;

const PANEL_TRANSITION = { type: "spring", duration: 0.4, bounce: 0 } as const;

export interface ExpandDetailsItem {
  label: string;
  value: string;
  /** Spans both columns (the doc's `col-span-2`, used by "Model"). */
  wide?: boolean;
}

export interface ExpandDetailsProps {
  /** Header label (default "Details"). */
  title?: string;
  /** Detail rows; defaults to the doc's Model/Tokens/Cost/Latency/Temperature. */
  items?: ExpandDetailsItem[];
  /** Starts expanded (default true, as in the doc). */
  defaultOpen?: boolean;
  expandedWidth?: number;
  collapsedWidth?: number;
  className?: string;
}

const DEFAULT_ITEMS: ExpandDetailsItem[] = [
  { label: "Model", value: "GPT 5.5 Codex", wide: true },
  { label: "Tokens", value: "3.4K" },
  { label: "Cost", value: "$0.27" },
  { label: "Latency", value: "1.4s" },
  { label: "Temperature", value: "0.7" },
];

function ExpandDetails({
  title = "Details",
  items = DEFAULT_ITEMS,
  defaultOpen = true,
  expandedWidth = 320,
  collapsedWidth = 120,
  className,
}: ExpandDetailsProps) {
  const reduceMotion = useReducedMotion();
  const [isOpen, setIsOpen] = React.useState(defaultOpen);
  const [contentHeight, setContentHeight] = React.useState(0);
  const contentRef = React.useRef<HTMLDivElement>(null);

  /* Stands in for `react-use-measure` (`offsetSize: true`): border-box block
   * size of the content, so the card can animate its own height. */
  React.useEffect(() => {
    const node = contentRef.current;
    if (!node || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      const box = entry?.borderBoxSize?.[0];
      const height = box ? box.blockSize : (entry?.contentRect.height ?? node.offsetHeight);
      setContentHeight(height);
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <motion.div
      initial={false}
      animate={{
        width: isOpen ? expandedWidth : collapsedWidth,
        height: contentHeight > 0 ? contentHeight : "auto",
      }}
      transition={
        reduceMotion
          ? { duration: 0 }
          : {
              height: { ...SPRING_CONFIG, delay: isOpen ? 0.25 : 0 },
              width: { ...SPRING_CONFIG, delay: isOpen ? 0 : 0.3 },
            }
      }
      className={cn("overflow-hidden rounded-xl border border-border bg-card text-card-foreground", className)}
    >
      <div ref={contentRef} className="relative px-4 py-2">
        <motion.button
          type="button"
          layout="position"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-expanded={isOpen}
          className="flex w-full items-center gap-1 text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          <motion.span
            animate={{ rotate: isOpen ? 0 : -90 }}
            transition={reduceMotion ? { duration: 0 } : { duration: 0.2, ease: "easeOut", delay: 0.3 }}
            className="flex items-center justify-center"
          >
            <ChevronDown className="size-5 stroke-2" aria-hidden="true" />
          </motion.span>
          <span className="text-lg font-medium tracking-tight text-foreground">{title}</span>
        </motion.button>

        <AnimatePresence initial={false} mode="popLayout">
          {isOpen && (
            <motion.div
              key="expand-details-panel"
              initial={reduceMotion ? false : { opacity: 0, filter: "blur(8px)", y: 40 }}
              animate={{
                opacity: 1,
                filter: "blur(0px)",
                y: 0,
                transition: reduceMotion ? { duration: 0 } : { ...PANEL_TRANSITION, delay: 0.3 },
              }}
              exit={reduceMotion ? undefined : { opacity: 0, filter: "blur(8px)", y: 16 }}
              transition={reduceMotion ? { duration: 0 } : PANEL_TRANSITION}
              className="min-w-[320px] overflow-hidden"
            >
              <div className="mt-3 ml-6 grid grid-cols-2 gap-x-4 gap-y-5">
                {items.map((item) => (
                  <div key={item.label} className={cn(item.wide && "col-span-2")}>
                    <div className="text-sm font-medium text-muted-foreground">{item.label}</div>
                    <div className="mt-1 text-lg tracking-tight text-foreground">{item.value}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export { ExpandDetails };
