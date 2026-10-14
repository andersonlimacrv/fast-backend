import * as React from "react";
import { animate, motion, useReducedMotion } from "motion/react";

import { UsageActionsMenu, UsagePeriodMenu, type UsageAction } from "@/components/billing/credit-usage-card-menus";
import { SegmentedProgressBar } from "@/components/custom-ui/components/segmented-progress-bar";
import { Switch } from "@/components/custom-ui/components/switch";
import { Download, Printer, RefreshCw, Share2 } from "@/lib/icons";
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
  /** Fills the label and the bar from 0 to `usedCreditsPercent` on mount
   * (the validated CircularProgress driver). Default true. */
  animateOnMount?: boolean;
  /** Mount fill duration in ms (ignored when `animateOnMount` is off). */
  transitionLength?: number;
}

const PERIOD_OPTIONS = ["7 Days", "14 Days", "30 Days", "90 Days", "12 Months"] as const;

/* CSS `ease` — the curve the CircularProgress mount fill uses. */
const EASE: [number, number, number, number] = [0.25, 0.1, 0.25, 1];

const DEFAULT_HISTORY: UsageHistoryItem[] = [
  { date: "Sep 16, 09:26 AM", model: "model-a", credits: "641.5K", cost: "$0.54" },
  { date: "Sep 16, 09:21 AM", model: "model-a", credits: "334.1K", cost: "$0.27" },
  { date: "Sep 16, 09:18 AM", model: "model-b", credits: "194.4K", cost: "$0.11" },
  { date: "Sep 16, 09:16 AM", model: "model-a", credits: "277.1K", cost: "$0.21" },
];

export function CreditUsageCard({
  usedCreditsPercent = 56.4,
  totalCreditsLabel = "100M CREDITS",
  creditsUsedLabel = "56.4M",
  creditsLeftLabel = "43.6M",
  usageHistory = DEFAULT_HISTORY,
  onAutoSwitchChange,
  onManagePlan,
  onViewAll,
  animateOnMount = true,
  transitionLength = 1000,
}: CreditUsageCardProps): React.ReactElement {
  const reduceMotion = useReducedMotion();
  const [autoSwitch, setAutoSwitch] = React.useState(true);
  const [selectedPeriod, setSelectedPeriod] = React.useState<string>("30 Days");
  const [downloadDone, setDownloadDone] = React.useState(false);
  const resetTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const clamped = Math.min(100, Math.max(0, usedCreditsPercent));

  /* Mount fill, entry-only (mirrors the validated CircularProgress driver): the
   * target is latched on mount, the label and the bar read the same painted
   * value (never drift apart), and a prop change after mounting — a live
   * slider, a refetch — settles instantly: the cleanup stops any in-flight
   * fill, so no 1s tween chases every tick and no animations overlap.
   * `jumpsToTarget` is derived at render — reduced motion / no duration /
   * animateOnMount=false never schedule a frame they do not need. */
  const jumpsToTarget = !animateOnMount || transitionLength <= 0 || reduceMotion === true;
  const [entryTarget] = React.useState(() => clamped);
  const [displayed, setDisplayed] = React.useState(() => (jumpsToTarget ? entryTarget : 0));
  const [settled, setSettled] = React.useState(jumpsToTarget);
  const displayedRef = React.useRef(displayed);

  React.useEffect(() => {
    if (settled || displayedRef.current === entryTarget) return;
    const controls = animate(displayedRef.current, entryTarget, {
      duration: transitionLength / 1000,
      ease: EASE,
      onUpdate: (latest) => {
        /* One decimal — the label's precision — so no-op frames are skipped. */
        const rounded = Math.round(latest * 10) / 10;
        if (rounded === displayedRef.current) return;
        displayedRef.current = rounded;
        setDisplayed(rounded);
      },
      onComplete: () => {
        displayedRef.current = entryTarget;
        setDisplayed(entryTarget);
        setSettled(true);
      },
    });
    return () => controls.stop();
  }, [entryTarget, transitionLength, settled]);

  React.useEffect(() => {
    if (!settled && clamped !== entryTarget) setSettled(true);
  }, [clamped, entryTarget, settled]);

  const painted = settled ? clamped : displayed;

  React.useEffect(
    () => () => {
      if (resetTimer.current) clearTimeout(resetTimer.current);
    },
    [],
  );

  function handleAutoSwitchChange(next: boolean): void {
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

  const moreOptions: UsageAction[] = [
    { label: "Export CSV", icon: <Download className="size-3.5" aria-hidden="true" />, onSelect: handleDownload },
    {
      label: "Print history",
      icon: <Printer className="size-3.5" aria-hidden="true" />,
      onSelect: () => window.print(),
    },
    {
      label: "Share report",
      icon: <Share2 className="size-3.5" aria-hidden="true" />,
      onSelect: () => undefined,
    },
    {
      label: "Refresh data",
      icon: <RefreshCw className="size-3.5" aria-hidden="true" />,
      onSelect: () => undefined,
    },
  ];

  return (
    <div
      data-current-value={painted}
      className="w-full max-w-135 overflow-hidden rounded-xl border border-border bg-card font-sans text-foreground shadow-lg transition-all duration-500 select-none"
    >
      <div className="flex flex-col items-start justify-between gap-4 bg-muted/50 px-4 py-5 sm:flex-row sm:items-center sm:px-6 md:px-8">
        <div>
          <h3 className="mb-1 text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase">
            Credits Used
          </h3>
          <span className="font-mono text-2xl font-medium tabular-nums sm:text-3xl">{painted.toFixed(1)}%</span>
        </div>
        <div className="mt-1 flex items-center gap-2 self-end sm:self-auto">
          <span className="max-w-40 text-right text-[10px] leading-tight font-bold tracking-wider text-muted-foreground uppercase">
            Auto-switch to cheaper model at limit
          </span>
          <Switch
            width={40}
            height={20}
            checked={autoSwitch}
            onCheckedChange={handleAutoSwitchChange}
            aria-label="Auto-switch to cheaper model at limit"
            className="shrink-0"
          />
        </div>
      </div>

      <SegmentedProgressBar
        value={painted}
        ariaValueNow={clamped}
        label="Credits used"
        className="bg-muted/50 px-4 sm:px-6 md:px-8"
      />

      <div className="flex items-center justify-between bg-muted/50 px-4 py-4 text-xs font-bold sm:px-6 md:px-8">
        <span className="text-muted-foreground">
          {creditsUsedLabel} <span className="text-muted-foreground/70">/ {totalCreditsLabel}</span>
        </span>
        <span className="text-muted-foreground">
          {creditsLeftLabel}{" "}
          <span className="hidden text-muted-foreground/70 sm:inline">CREDITS LEFT</span>
        </span>
      </div>

      <div className="h-px w-full border-b border-dashed border-border" />

      <div className="flex flex-row flex-wrap items-center justify-between gap-2 bg-muted/50 px-4 pt-4 pb-4 sm:flex-nowrap sm:px-6 md:px-8">
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
        <div className="flex-shrink-0">
          <UsagePeriodMenu options={PERIOD_OPTIONS} value={selectedPeriod} onValueChange={setSelectedPeriod} />
        </div>
      </div>

      <div className="overflow-x-auto bg-muted/50 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="min-w-[500px] space-y-0.5 border-b border-border px-4 py-2 sm:px-6 md:px-8">
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

      <div className="flex flex-col items-center justify-between gap-4 bg-card px-4 pt-4 pb-4 sm:flex-row sm:px-6 md:px-8">
        <div className="flex items-center gap-3 self-start text-muted-foreground sm:self-auto">
          <div className="flex items-center">
            <UsageActionsMenu actions={moreOptions} />
          </div>
          <div className="h-4 w-px bg-border" aria-hidden="true" />
          <button
            type="button"
            aria-label="Export usage history as CSV"
            onClick={handleDownload}
            className="group relative flex items-center justify-center rounded-md focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
          >
            <motion.span
              animate={
                downloadDone && !reduceMotion
                  ? { scale: [1, 1.25, 1], rotate: [0, 5, -5, 0] }
                  : { scale: 1, rotate: 0 }
              }
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
