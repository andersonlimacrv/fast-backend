/* SubscriptionCalendar — subscription calendar ported from the Watermelon UI
 * registry (`https://ui.watermelon.sh/animated-components/subscription-calendar`,
 * fetched 2026-09-23), item 18, change `custom-ui-subscription-calendar`.
 *
 * Faithful to the registry's structure and motion: the card entrance
 * (`scale 0.96 → 1`, spring 420/28/0.6), the month/year header with prev/next
 * and the "+" action, the three backdrop-blur overlays (quick add, search,
 * monthly summary) with their scale/y transitions, the weekday pills, the day
 * grid (aspect-square cells with the animated glow on the selected day, logos
 * + indicator dots) and the footer (legend, SUBS/NEW counts, search/export/
 * summary actions + MONTHLY TOTAL). The frozen doc
 * (`ExempleLayours.md/SubsriptionCalendar.md`) carries this same component
 * next to its token `-base` variant.
 *
 * Full theme mapping (owner: our color scheme, same effect in light and dark):
 * every zinc/hex — including the Watermelon orange, purple and yellow — becomes
 * a token from `index.css` (`bg-card`, `border-border`, `bg-popover`,
 * `bg-muted…`, `text-foreground`, `text-muted-foreground`, `bg-primary`,
 * `text-primary-foreground`, `bg-chart-2/10`, `text-chart-2`, `chart-2`/`chart-4`
 * legend). Accents follow the validated solid-fill rule (Checkbox/Switch: full
 * `bg-primary` with dark content, 9.11:1) instead of transparent tints — Total
 * card and add badge are solid lime with `primary-foreground` text, so they
 * read in both themes with no `dark:` branches; the selected day keeps the
 * 2px outline and a 60% fill in primary (owner: same spec — number 10.97:1
 * light · 5.8:1 dark, no number change needed) — `border-primary` over
 * `bg-primary/60`, with the number in `text-primary-foreground` (the inherited
 * white-on-lime would fail in dark); corners stay `rounded-xl`
 * (radius rule). Icons come through
 * `lib/icons`; the glow `layoutId` is scoped with `useId`; the `xs:` classes
 * become `sm:`; the "+" keeps the press scale only; the download timer is
 * cleared on unmount; icon-only buttons get aria labels, day cells
 * `aria-pressed`, focus is `ring-2` (DESIGN.md §8) and reduced motion skips
 * entrance/layout. */

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import * as React from "react";

import { Check, ChevronLeft, ChevronRight, Download, LoaderCircle, Plus, Search, TbCube, X } from "@/lib/icons";
import { cn } from "@/lib/utils";

const SPRING = {
  type: "spring",
  stiffness: 420,
  damping: 28,
  mass: 0.6,
} as const;

const WEEKDAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"] as const;

export interface SubscriptionDay {
  date: number;
  isMuted?: boolean;
  isLogo?: React.ReactNode[];
  indicators?: React.ReactNode[];
}

export interface SubscriptionCalendarProps {
  month: string;
  year: number;
  days: SubscriptionDay[];
  monthlyTotal: number;
  subscriptionsCount: number;
  newCount: number;
  onPrevMonth?: () => void;
  onNextMonth?: () => void;
  /** Day id selected on mount (`day-<date>-<index>`); none by default. */
  defaultSelectedId?: string | null;
  className?: string;
}

/** Shared shell of the three overlays (close, round icon badge, title). */
function Overlay({
  onClose,
  icon,
  iconClassName,
  title,
  children,
  reduceMotion,
}: {
  onClose: () => void;
  icon: React.ReactNode;
  iconClassName: string;
  title: string;
  children: React.ReactNode;
  reduceMotion: boolean;
}) {
  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, scale: 0.9, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={reduceMotion ? undefined : { opacity: 0, scale: 0.9, y: 10 }}
      transition={reduceMotion ? { duration: 0 } : undefined}
      className="bg-card/95 absolute inset-0 z-50 flex flex-col items-center justify-center rounded-xl p-4 backdrop-blur-md sm:p-6"
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="text-muted-foreground hover:text-foreground absolute top-4 right-4 rounded-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      >
        <X size={20} aria-hidden="true" />
      </button>
      <div className={cn("mb-4 flex h-12 w-12 items-center justify-center rounded-full", iconClassName)}>
        {icon}
      </div>
      <h3 className="text-foreground mb-1 text-sm font-bold">{title}</h3>
      {children}
    </motion.div>
  );
}

function SubscriptionCalendar({
  month,
  year,
  days,
  monthlyTotal,
  subscriptionsCount,
  newCount,
  onPrevMonth,
  onNextMonth,
  defaultSelectedId = null,
  className,
}: SubscriptionCalendarProps) {
  const reduceMotion = useReducedMotion() === true;
  const glowId = React.useId();
  const [selectedId, setSelectedId] = React.useState<string | null>(defaultSelectedId);
  const [isAdding, setIsAdding] = React.useState(false);
  const [isSearching, setIsSearching] = React.useState(false);
  const [isSummaryOpen, setIsSummaryOpen] = React.useState(false);
  const [isDownloading, setIsDownloading] = React.useState(false);
  const downloadTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(
    () => () => {
      if (downloadTimer.current) clearTimeout(downloadTimer.current);
    },
    [],
  );

  function handleDownload(): void {
    setIsDownloading(true);
    if (downloadTimer.current) clearTimeout(downloadTimer.current);
    downloadTimer.current = setTimeout(() => setIsDownloading(false), 2000);
  }

  return (
    <motion.div
      initial={reduceMotion ? false : { scale: 0.96, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={reduceMotion ? { duration: 0 } : SPRING}
      className={cn(
        "bg-card border-border relative w-full max-w-105 rounded-xl border p-4 shadow-2xl transition-all duration-500 sm:p-5",
        className,
      )}
    >
      <div className="mb-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 overflow-hidden sm:gap-3">
          <h2 className="text-foreground truncate text-[12px] font-medium sm:text-[13px]">
            {month}, {year}
          </h2>
          <span className="border-input text-muted-foreground hidden cursor-default rounded-full border bg-transparent px-3 py-0.5 text-[10px] whitespace-nowrap sm:inline-block">
            Today
          </span>
          <div className="ml-1 flex items-center gap-1 sm:gap-2">
            <button
              type="button"
              aria-label="Previous month"
              onClick={onPrevMonth}
              className="hover:bg-muted text-muted-foreground hover:text-foreground shrink-0 rounded-md p-1 transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              <ChevronLeft size={18} aria-hidden="true" />
            </button>
            <button
              type="button"
              aria-label="Next month"
              onClick={onNextMonth}
              className="hover:bg-muted text-muted-foreground hover:text-foreground shrink-0 rounded-md p-1 transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              <ChevronRight size={18} aria-hidden="true" />
            </button>
          </div>
        </div>
        <button
          type="button"
          aria-label="Add subscription"
          onClick={() => setIsAdding(true)}
          className="bg-primary text-primary-foreground flex h-7 w-10 shrink-0 items-center justify-center rounded-full shadow-[0_0_15px_color-mix(in_srgb,var(--color-primary)_20%,transparent)] transition-transform active:scale-95 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none sm:w-11"
        >
          <Plus size={16} aria-hidden="true" />
        </button>
      </div>

      <div>
        <AnimatePresence>
          {isAdding && (
            <Overlay
              onClose={() => setIsAdding(false)}
              icon={<Plus size={24} aria-hidden="true" />}
              iconClassName="bg-primary text-primary-foreground"
              title="Quick Add Subscription"
              reduceMotion={reduceMotion}
            >
              <p className="text-muted-foreground mb-6 text-center text-[10px]">
                Enter the details of your new recurring payment.
              </p>
              <div className="flex w-full flex-col gap-2">
                <input
                  type="text"
                  placeholder="Service Name (e.g. Netflix)"
                  aria-label="Service name"
                  className="border-input bg-transparent w-full rounded-lg border px-3 py-2 text-[11px] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
                <div className="flex flex-col gap-2 sm:flex-row">
                  <input
                    type="text"
                    placeholder="Amount"
                    aria-label="Amount"
                    className="border-input bg-transparent flex-1 rounded-lg border px-3 py-2 text-[11px] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  />
                  <input
                    type="text"
                    placeholder="Date"
                    aria-label="Date"
                    className="border-input bg-transparent w-full rounded-lg border px-3 py-2 text-[11px] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring sm:w-20"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="bg-primary text-primary-foreground mt-2 flex w-full items-center justify-center gap-2 rounded-lg py-2 text-[11px] font-bold transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                >
                  <Check size={14} aria-hidden="true" /> Add Subscription
                </button>
              </div>
            </Overlay>
          )}

          {isSearching && (
            <Overlay
              onClose={() => setIsSearching(false)}
              icon={<Search size={24} aria-hidden="true" />}
              iconClassName="bg-muted text-muted-foreground"
              title="Search Subscriptions"
              reduceMotion={reduceMotion}
            >
              <div className="mt-4 w-full">
                <input
                  autoFocus
                  type="text"
                  placeholder="Type to search..."
                  aria-label="Search subscriptions"
                  className="border-input bg-transparent w-full rounded-lg border px-3 py-2 text-[11px] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>
              <div className="mt-4 w-full text-center">
                <p className="text-muted-foreground text-[10px]">Start typing to see results</p>
              </div>
            </Overlay>
          )}

          {isSummaryOpen && (
            <Overlay
              onClose={() => setIsSummaryOpen(false)}
              icon={<TbCube size={24} aria-hidden="true" />}
              iconClassName="bg-chart-2/10 text-chart-2"
              title="Monthly Summary"
              reduceMotion={reduceMotion}
            >
              <div className="mt-4 grid w-full grid-cols-2 gap-3">
                <div className="bg-muted/50 rounded-lg p-3">
                  <div className="text-muted-foreground text-[9px]">Active</div>
                  <div className="text-foreground text-sm font-bold">{subscriptionsCount}</div>
                </div>
                <div className="bg-muted/50 rounded-lg p-3">
                  <div className="text-muted-foreground text-[9px]">New</div>
                  <div className="text-foreground text-sm font-bold">{newCount}</div>
                </div>
                <div className="bg-primary col-span-2 rounded-lg p-3 text-center">
                  <div className="text-primary-foreground text-[9px] font-medium">Total Spend</div>
                  <div className="text-primary-foreground text-base font-bold">${monthlyTotal.toFixed(2)}</div>
                </div>
              </div>
            </Overlay>
          )}
        </AnimatePresence>

        <div className="text-muted-foreground mb-2 grid grid-cols-7 gap-1 text-[8px] font-semibold tracking-wider sm:text-[9px]">
          {WEEKDAYS.map((day) => (
            <div key={day} className="bg-muted/60 border-border rounded-full border py-1.5 text-center">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
          {days.map((day, idx) => {
            const uniqueId = `day-${day.date}-${idx}`;
            const isActive = selectedId === uniqueId;
            return (
              <motion.button
                key={uniqueId}
                type="button"
                layout={!reduceMotion}
                whileTap={reduceMotion ? undefined : { scale: 0.95 }}
                onClick={() => setSelectedId(uniqueId)}
                transition={reduceMotion ? { duration: 0 } : SPRING}
                aria-pressed={isActive}
                aria-label={`Day ${day.date}`}
                className={cn(
                  "relative flex aspect-square flex-col items-center justify-center rounded-xl border text-[10px] font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none sm:h-12 sm:text-[11px]",
                  day.isMuted
                    ? "bg-muted/40 border-border text-muted-foreground/60"
                    : "bg-muted/60 border-border text-foreground hover:border-muted-foreground/20",
                  /* Selected day (owner: same spec, primary instead of accent):
                   * the inherited `text-foreground` would vanish on the lime
                   * fill in dark mode (white on lime), so the number takes
                   * `text-primary-foreground` — twMerge keeps the logos' own
                   * colors untouched. */
                  isActive && "text-primary-foreground",
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId={`${glowId}-active-glow`}
                    data-slot="day-glow"
                    className="border-primary bg-primary/60 absolute inset-0 z-0 rounded-xl border-2"
                    transition={reduceMotion ? { duration: 0 } : SPRING}
                  />
                )}
                <div className="relative z-10 flex flex-col items-center justify-start gap-0.5 sm:gap-1">
                  <span>{day.date}</span>
                  <span className="scale-75 sm:scale-100">{day.isLogo}</span>
                </div>
                {day.indicators && (
                  <div className="absolute top-1 right-1 flex gap-0.5 sm:top-1.5 sm:right-1.5">
                    {day.indicators}
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Footer info */}
      <div className="text-muted-foreground mt-5 flex items-center justify-between gap-2 text-[8px] font-semibold tracking-widest sm:text-[9px]">
        <div className="flex items-center gap-2 sm:gap-4">
          <span className="hover:text-chart-2 flex cursor-default items-center gap-1.5 transition-colors">
            <span className="bg-chart-2 h-1 w-1 rounded-full sm:h-1.5 sm:w-1.5" />
            MONTHLY
          </span>
          <span className="hover:text-chart-4 flex cursor-default items-center gap-1.5 transition-colors">
            <span className="bg-chart-4 h-1 w-1 rounded-full sm:h-1.5 sm:w-1.5" />
            YEARLY
          </span>
        </div>
        <span className="text-muted-foreground whitespace-nowrap">
          <span className="text-foreground">{subscriptionsCount}</span> SUBS /{" "}
          <span className="text-foreground">{newCount}</span> NEW
        </span>
      </div>

      {/* Bottom bar */}
      <div className="border-border mt-4 flex items-center justify-between gap-2 border-t pt-4">
        <div className="text-muted-foreground flex gap-3 sm:gap-4">
          <button
            type="button"
            aria-label="Search subscriptions"
            onClick={() => setIsSearching(true)}
            className="hover:text-foreground shrink-0 rounded-md transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            <Search size={16} aria-hidden="true" />
          </button>
          <button
            type="button"
            aria-label="Export calendar"
            onClick={handleDownload}
            disabled={isDownloading}
            className="hover:text-foreground flex items-center justify-center rounded-md transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            {isDownloading ? (
              <LoaderCircle size={16} className="text-primary animate-spin" aria-hidden="true" />
            ) : (
              <Download size={16} className="shrink-0" aria-hidden="true" />
            )}
          </button>
          <button
            type="button"
            aria-label="Monthly summary"
            onClick={() => setIsSummaryOpen(true)}
            className="hover:text-foreground shrink-0 rounded-md transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            <TbCube size={16} aria-hidden="true" />
          </button>
        </div>
        <div className="text-muted-foreground truncate text-[9px] font-medium sm:text-[10px]">
          MONTHLY TOTAL :{" "}
          <span className="text-foreground ml-1 text-[11px] font-bold sm:text-[12px]">
            ${monthlyTotal.toFixed(2)}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

export { SubscriptionCalendar };
