import * as React from "react";
import { AnimatePresence, motion, useReducedMotion, type Transition } from "motion/react";

import {
  BsFileTextFill,
  BsSendFill,
  BsTagFill,
  FaInbox,
  HiBadgeCheck,
  IoCloseSharp,
  RiBubbleChartFill,
  TbClockHour12Filled,
  Zap,
} from "@/lib/icons";
import type { IconType } from "@/lib/icons";
import { cn } from "@/lib/utils";

/* Run action button: staged runner for jobs/pipelines only (imports, analysis,
 * reports). NOT for CRUD — use plain buttons + toasts there. */

export interface RunActionStep {
  id: number;
  label: string;
  icon: IconType;
}

export interface RunActionButtonProps {
  steps?: RunActionStep[];
}

const DEFAULT_STEPS: RunActionStep[] = [
  { id: 1, label: "Importing Survey Data", icon: FaInbox },
  { id: 2, label: "Refining Responses", icon: RiBubbleChartFill },
  { id: 3, label: "Labelling Responses", icon: BsTagFill },
  { id: 4, label: "Analyzing Sentiment", icon: TbClockHour12Filled },
  { id: 5, label: "Creating Reports", icon: BsFileTextFill },
  { id: 6, label: "Sharing Survey Report", icon: BsSendFill },
];

/* Simulation tick between steps; every motion transition stays within 120–250ms. */
const STEP_INTERVAL_MS = 250;

const tween: Transition = { duration: 0.2, ease: "easeOut" };
const instant: Transition = { duration: 0 };

function AnimatedText({
  text,
  className,
  delayStep = 0.008,
}: {
  text: string;
  className?: string;
  delayStep?: number;
}): React.ReactElement {
  const reduceMotion = useReducedMotion();
  if (reduceMotion) return <span className={className}>{text}</span>;
  const chars = text.split("");
  return (
    <span className={className} style={{ display: "inline-flex" }}>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span key={text} style={{ display: "inline-flex", willChange: "transform" }}>
          {chars.map((char, i) => (
            <motion.span
              key={i}
              initial={{ y: 10, opacity: 0, scale: 0.5 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -10, opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.15, ease: "easeOut", delay: i * delayStep }}
              style={{ display: "inline-block", whiteSpace: char === " " ? "pre" : undefined }}
            >
              {char}
            </motion.span>
          ))}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

export function RunActionButton({ steps = DEFAULT_STEPS }: RunActionButtonProps): React.ReactElement | null {
  const reduceMotion = useReducedMotion();
  const [status, setStatus] = React.useState<"idle" | "running" | "done">("idle");
  const [currentStep, setCurrentStep] = React.useState(0);

  React.useEffect(() => {
    if (status !== "running") return;
    if (currentStep >= steps.length - 1) {
      const t = setTimeout(() => setStatus("done"), STEP_INTERVAL_MS);
      return () => clearTimeout(t);
    }
    const interval = setInterval(() => {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
    }, STEP_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [status, currentStep, steps.length]);

  if (steps.length === 0) return null;
  const active = steps[Math.min(currentStep, steps.length - 1)];
  if (!active) return null;
  const StepIcon = active.icon;

  function startAction(): void {
    setStatus("running");
    setCurrentStep(0);
  }

  function reset(): void {
    setStatus("idle");
    setCurrentStep(0);
  }

  const widths = { idle: 180, running: 360, done: 200 };
  const fade = reduceMotion ? instant : tween;

  return (
    <div className="flex items-center justify-center">
      <motion.div
        initial={{ width: 180 }}
        animate={{ width: widths[status] }}
        transition={reduceMotion ? instant : { duration: 0.2, ease: "easeOut" }}
        className={cn(
          "relative flex h-[64px] items-center justify-between overflow-hidden rounded-lg",
          status === "running" ? "border-2 border-dashed border-border" : "border-2 border-transparent",
        )}
      >
        <AnimatePresence mode="popLayout" initial={false}>
          {status === "idle" && (
            <motion.button
              key="idle"
              type="button"
              aria-label="Run action"
              onClick={startAction}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={fade}
              className="flex flex-1 items-center gap-2 rounded-lg bg-muted px-5 py-3 whitespace-nowrap focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              <Zap className="h-6 w-6 text-foreground" aria-hidden="true" />
              <AnimatedText text="Run Action" className="text-[18px] font-medium text-foreground" />
            </motion.button>
          )}

          {status === "running" && (
            <motion.div
              key="running"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={fade}
              className="flex flex-1 items-center justify-between gap-3 px-4 whitespace-nowrap"
            >
              <div className="flex items-center gap-2">
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0 }}
                    transition={fade}
                  >
                    <StepIcon className="h-6 w-6 text-foreground" aria-hidden="true" />
                  </motion.div>
                </AnimatePresence>
                <AnimatedText
                  text={active.label}
                  className="text-[18px] font-bold text-foreground"
                />
              </div>
              <motion.button
                type="button"
                aria-label="Cancel run"
                onClick={reset}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={reduceMotion ? instant : { duration: 0.2, ease: "easeOut", delay: 0.15 }}
                className="ml-1 rounded-lg bg-secondary p-1.5 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              >
                <IoCloseSharp className="h-4 w-4 text-secondary-foreground" aria-hidden="true" />
              </motion.button>
            </motion.div>
          )}

          {status === "done" && (
            <motion.button
              key="done"
              type="button"
              aria-label="Reset"
              onClick={reset}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={fade}
              className="flex flex-1 items-center gap-2 rounded-lg bg-accent px-5 py-3 whitespace-nowrap focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              <HiBadgeCheck className="h-6 w-6 text-accent-foreground" aria-hidden="true" />
              <AnimatedText text="Action Done" className="text-[18px] font-bold text-accent-foreground" />
            </motion.button>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
