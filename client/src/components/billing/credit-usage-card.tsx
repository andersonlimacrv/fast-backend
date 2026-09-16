import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { Check, ChevronDown, Download, MoreVertical, Printer, RefreshCw, Share2 } from "@/lib/icons";
import { cn } from "@/lib/utils";

/* Credit usage card: segmented bar, auto-switch toggle, history, overflow menu.
 * Display only — parents own data + plan actions via callbacks. */

export interface UsageHistoryItem {
  date: string;
  model: string;
  credits: string;
  cost: string;
}

export interface CreditUsageCardProps {
  usedCreditsPercent?: number;
  totalCreditsLabel?: string;
  creditsUsedLabel?: string;
  creditsLeftLabel?: string;
  usageHistory?: UsageHistoryItem[];
  onAutoSwitchChange?: (enabled: boolean) => void;
  onManagePlan?: () => void;
  onViewAll?: () => void;
}

const PERIOD_OPTIONS = ["7 Days", "14 Days", "30 Days", "90 Days", "12 Months"] as const;

const DEFAULT_HISTORY: UsageHistoryItem[] = [
  { date: "Sep 16, 09:26 AM", model: "model-a", credits: "641.5K", cost: "$0.54" },
  { date: "Sep 16, 09:21 AM", model: "model-a", credits: "334.1K", cost: "$0.27" },
  { date: "Sep 16, 09:18 AM", model: "model-b", credits: "194.4K", cost: "$0.11" },
  { date: "Sep 16, 09:16 AM", model: "model-a", credits: "277.1K", cost: "$0.21" },
];

const SEGMENTS = 75;

const popoverAnim = {
  initial: { opacity: 0, y: 4, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: 4, scale: 0.98 },
  transition: { type: "spring" as const, stiffness: 450, damping: 25 },
} as const;

const instantAnim = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0 },
} as const;

export function CreditUsageCard({
  usedCreditsPercent = 56.4,
  totalCreditsLabel = "100M CREDITS",
  creditsUsedLabel = "56.4M",
  creditsLeftLabel = "43.6M",
  usageHistory = DEFAULT_HISTORY,
  onAutoSwitchChange,
  onManagePlan,
  onViewAll,
}: CreditUsageCardProps): React.ReactElement {
  const reduceMotion = useReducedMotion();
  const anim = reduceMotion ? instantAnim : popoverAnim;
  const [autoSwitch, setAutoSwitch] = React.useState(true);
  const [activePopover, setActivePopover] = React.useState<"more" | "period" | null>(null);
  const [selectedPeriod, setSelectedPeriod] = React.useState<string>("30 Days");
  const [downloadDone, setDownloadDone] = React.useState(false);
  const moreRef = React.useRef<HTMLDivElement>(null);
  const periodRef = React.useRef<HTMLDivElement>(null);
  const resetTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const clamped = Math.min(100, Math.max(0, usedCreditsPercent));

  React.useEffect(
    () => () => {
      if (resetTimer.current) clearTimeout(resetTimer.current);
    },
    [],
  );

  React.useEffect(() => {
    function onPointer(e: MouseEvent): void {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setActivePopover((prev) => (prev === "more" ? null : prev));
      }
      if (periodRef.current && !periodRef.current.contains(e.target as Node)) {
        setActivePopover((prev) => (prev === "period" ? null : prev));
      }
    }
    function onKey(e: KeyboardEvent): void {
      if (e.key === "Escape") setActivePopover(null);
    }
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  function handleToggleAutoSwitch(): void {
    const next = !autoSwitch;
    setAutoSwitch(next);
    onAutoSwitchChange?.(next);
  }

  function handleDownload(): void {
    const headers = ["Date", "Model", "Credits", "Cost"];
    const rows = usageHistory.map((r) => [r.date, r.model, r.credits, r.cost]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "credit-usage.csv";
    a.click();
    URL.revokeObjectURL(url);
    setDownloadDone(true);
    if (resetTimer.current) clearTimeout(resetTimer.current);
    resetTimer.current = setTimeout(() => setDownloadDone(false), 2000);
  }

  const moreOptions: { label: string; icon: React.ReactNode; action: () => void }[] = [
    { label: "Export CSV", icon: <Download className="size-3.5" aria-hidden="true" />, action: handleDownload },
    {
      label: "Print history",
      icon: <Printer className="size-3.5" aria-hidden="true" />,
      action: () => setActivePopover(null),
    },
    {
      label: "Share report",
      icon: <Share2 className="size-3.5" aria-hidden="true" />,
      action: () => setActivePopover(null),
    },
    {
      label: "Refresh data",
      icon: <RefreshCw className="size-3.5" aria-hidden="true" />,
      action: () => setActivePopover(null),
    },
  ];

  return (
    <div className="w-full max-w-xl overflow-hidden rounded-lg border border-border bg-card font-sans text-foreground shadow-lg select-none">
      <div className="flex flex-col items-start justify-between gap-4 bg-muted/50 px-4 py-5 sm:flex-row sm:items-center sm:px-6">
        <div>
          <h3 className="mb-1 text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase">
            Credits Used
          </h3>
          <span className="font-sans text-2xl font-medium sm:text-3xl">{clamped}%</span>
        </div>
        <div className="mt-1 flex items-center gap-2 self-end sm:self-auto">
          <span className="max-w-40 text-right text-[10px] leading-tight font-bold tracking-wider text-muted-foreground uppercase">
            Auto-switch to cheaper model at limit
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={autoSwitch}
            aria-label="Auto-switch to cheaper model at limit"
            onClick={handleToggleAutoSwitch}
            className={cn(
              "relative flex h-5 w-10 shrink-0 items-center rounded-full border p-0.5 transition-colors duration-200",
              "motion-reduce:transition-none focus-visible:ring-ring focus-visible:ring-1 focus-visible:outline-none",
              autoSwitch ? "border-primary/40 bg-primary/15" : "border-border bg-muted",
            )}
          >
            <motion.span
              animate={{ x: autoSwitch ? 18 : 0 }}
              transition={
                reduceMotion
                  ? { duration: 0 }
                  : { type: "spring", stiffness: 500, damping: 30 }
              }
              className={cn(
                "block h-3.5 w-4 rounded-full",
                autoSwitch ? "bg-primary" : "bg-muted-foreground",
              )}
            />
          </button>
        </div>
      </div>

      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={clamped}
        aria-label="Credits used"
        className="flex h-3 gap-px bg-muted/50 px-4 sm:gap-1 sm:px-6"
      >
        {Array.from({ length: SEGMENTS }).map((_, i) => {
          const filled = i < (clamped / 100) * SEGMENTS;
          return (
            <div
              key={i}
              style={filled ? { opacity: 1 - i * 0.004 } : undefined}
              className={cn(
                "flex-1 rounded-sm transition-all duration-200 motion-reduce:transition-none",
                filled ? "bg-primary" : "bg-muted",
              )}
            />
          );
        })}
      </div>

      <div className="flex items-center justify-between bg-muted/50 px-4 py-4 text-xs font-bold sm:px-6">
        <span className="text-muted-foreground">
          {creditsUsedLabel} <span className="text-muted-foreground/70">/ {totalCreditsLabel}</span>
        </span>
        <span className="text-muted-foreground">
          {creditsLeftLabel}{" "}
          <span className="hidden text-muted-foreground/70 sm:inline">CREDITS LEFT</span>
        </span>
      </div>

      <div className="h-px w-full border-b border-dashed border-border" />

      <div className="flex flex-row flex-wrap items-center justify-between gap-2 bg-muted/50 px-4 pt-4 pb-4 sm:flex-nowrap sm:px-6">
        <div className="flex flex-shrink-0 items-center gap-2">
          <h4 className="font-sans text-sm font-medium whitespace-nowrap sm:text-base">
            Usage History
          </h4>
          <button
            type="button"
            onClick={onViewAll}
            className="shrink-0 rounded-md border border-border px-2 py-1 text-center text-[9px] whitespace-nowrap text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none active:scale-95"
          >
            View all
          </button>
        </div>
        <div ref={periodRef} className="relative flex-shrink-0">
          <button
            type="button"
            aria-haspopup="listbox"
            aria-expanded={activePopover === "period"}
            aria-label="Select usage period"
            onClick={() => setActivePopover((prev) => (prev === "period" ? null : "period"))}
            className="flex items-center gap-1 rounded-md border border-border px-2 py-1 text-[9px] whitespace-nowrap text-muted-foreground transition-all hover:bg-accent hover:text-accent-foreground focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none sm:gap-2"
          >
            {selectedPeriod}{" "}
            <ChevronDown
              className={cn(
                "size-2.5 transition-transform duration-200 motion-reduce:transition-none",
                activePopover === "period" && "rotate-180",
              )}
              aria-hidden="true"
            />
          </button>
          <AnimatePresence>
            {activePopover === "period" && (
              <motion.div
                {...anim}
                role="listbox"
                aria-label="Usage period"
                className="absolute top-full right-0 z-50 mt-2 w-36 overflow-hidden rounded-lg border border-border bg-popover py-1 text-popover-foreground shadow-xl"
              >
                {PERIOD_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    role="option"
                    aria-selected={selectedPeriod === opt}
                    onClick={() => {
                      setSelectedPeriod(opt);
                      setActivePopover(null);
                    }}
                    className={cn(
                      "flex w-full items-center justify-between px-3 py-2 text-left text-xs transition-colors",
                      "focus-visible:bg-accent focus-visible:outline-none",
                      selectedPeriod === opt
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-accent hover:text-accent-foreground",
                    )}
                  >
                    {opt}
                    {selectedPeriod === opt && <Check className="size-3" aria-hidden="true" />}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="overflow-x-auto bg-muted/50 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="min-w-[500px] space-y-0.5 border-b border-border px-4 py-2 sm:px-6">
          <div className="grid grid-cols-4 px-1 pb-2 text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
            <span>Date</span>
            <span>Model</span>
            <span className="text-right">Credits</span>
            <span className="text-right">Cost</span>
          </div>
          {usageHistory.length > 0 ? (
            usageHistory.map((row, idx) => (
              <div
                key={`${row.date}-${row.model}-${idx}`}
                className="group grid grid-cols-4 border-t border-border/50 px-1 py-2.5 text-[10.5px] text-muted-foreground transition-colors hover:bg-accent/30"
              >
                <span className="group-hover:text-foreground">{row.date}</span>
                <span className="truncate pr-2 font-medium group-hover:text-foreground">
                  {row.model}
                </span>
                <span className="text-right group-hover:text-foreground">{row.credits}</span>
                <span className="text-right font-bold group-hover:text-foreground">{row.cost}</span>
              </div>
            ))
          ) : (
            <div className="border-t border-border/50 py-8 text-center text-xs text-muted-foreground">
              No usage history available
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col items-center justify-between gap-4 bg-card px-4 pt-4 pb-4 sm:flex-row sm:px-6">
        <div className="flex items-center gap-3 self-start text-muted-foreground sm:self-auto">
          <div ref={moreRef} className="relative flex items-center">
            <button
              type="button"
              aria-haspopup="menu"
              aria-expanded={activePopover === "more"}
              aria-label="More actions"
              onClick={() => setActivePopover((prev) => (prev === "more" ? null : "more"))}
              className="flex items-center justify-center rounded-md focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
            >
              <MoreVertical
                className="size-4 cursor-pointer transition-colors hover:text-foreground"
                aria-hidden="true"
              />
            </button>
            <AnimatePresence>
              {activePopover === "more" && (
                <motion.div
                  {...anim}
                  role="menu"
                  aria-label="Usage history actions"
                  className="absolute bottom-full left-0 z-50 mb-2 w-44 overflow-hidden rounded-lg border border-border bg-popover py-1 text-popover-foreground shadow-xl"
                >
                  {moreOptions.map((opt) => (
                    <button
                      key={opt.label}
                      type="button"
                      role="menuitem"
                      onClick={opt.action}
                      className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-xs transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent focus-visible:outline-none"
                    >
                      <span className="text-muted-foreground/70">{opt.icon}</span>
                      {opt.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div className="h-4 w-px bg-border" aria-hidden="true" />
          <button
            type="button"
            aria-label="Export usage history as CSV"
            onClick={handleDownload}
            className="group relative flex items-center justify-center rounded-md focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
          >
            <motion.span
              animate={downloadDone && !reduceMotion ? { scale: [1, 1.2, 1] } : { scale: 1 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className={cn(
                "flex items-center justify-center transition-colors",
                downloadDone ? "text-primary" : "hover:text-foreground",
              )}
            >
              <Download className="size-4" aria-hidden="true" />
            </motion.span>
          </button>
        </div>

        <div className="flex w-full items-center justify-between gap-2 sm:w-auto sm:justify-end">
          <div className="flex items-center gap-1.5 py-1">
            <div
              aria-hidden="true"
              className="flex h-4 w-4 items-center justify-center rounded-sm bg-primary text-[10px] font-semibold text-primary-foreground"
            >
              S
            </div>
            <span className="text-[9px] font-bold tracking-tighter text-muted-foreground uppercase">
              Billing via Stripe
            </span>
          </div>
          <button
            type="button"
            onClick={onManagePlan}
            className="rounded-md border border-border px-3 py-2 font-sans text-xs font-normal whitespace-nowrap text-foreground transition-all hover:bg-foreground hover:text-background focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none active:scale-95"
          >
            Manage plan
          </button>
        </div>
      </div>
    </div>
  );
}
