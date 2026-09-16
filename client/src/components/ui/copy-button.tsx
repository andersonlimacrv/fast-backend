import { motion, useReducedMotion } from "motion/react";
import * as React from "react";

import { Check, Copy } from "@/lib/icons";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/* Copy button: clipboard write with icon-swap feedback.
 * Upstream hoverScale/tapScale on a reduced-motion-aware wrapper; local
 * delay/reset/clipboard behavior kept. variant/size pass to Button. */

export interface CopyButtonProps extends Omit<React.ComponentPropsWithoutRef<typeof Button>, "onClick" | "children"> {
  content: string;
  copied?: boolean;
  delay?: number;
  hoverScale?: number;
  tapScale?: number;
  onCopiedChange?: (copied: boolean, content?: string) => void;
}

const CopyButton = React.forwardRef<React.ElementRef<typeof Button>, CopyButtonProps>(
  (
    {
      className,
      content,
      copied: controlledCopied,
      delay = 3000,
      hoverScale = 1.05,
      tapScale = 0.95,
      onCopiedChange,
      variant = "ghost",
      size = "icon",
      ...props
    },
    ref,
  ) => {
    const [internalCopied, setInternalCopied] = React.useState(false);
    const reduceMotion = useReducedMotion();
    const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

    const copied = controlledCopied ?? internalCopied;

    React.useEffect(
      () => () => {
        if (timer.current) clearTimeout(timer.current);
      },
      [],
    );

    const setCopiedState = (next: boolean) => {
      if (controlledCopied === undefined) setInternalCopied(next);
      onCopiedChange?.(next, content);
    };

    const copy = async () => {
      try {
        await navigator.clipboard.writeText(content);
      } catch {
        return;
      }
      setCopiedState(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        setCopiedState(false);
      }, delay);
    };

    return (
      <motion.span
        whileHover={reduceMotion ? undefined : { scale: hoverScale }}
        whileTap={reduceMotion ? undefined : { scale: tapScale }}
        transition={{ duration: 0.15, ease: "easeOut" }}
        className="inline-flex"
      >
        <Button
          ref={ref}
          type="button"
          variant={variant}
          size={size}
          aria-label={copied ? "Copied" : "Copy to clipboard"}
          aria-live="polite"
          className={cn(className)}
          onClick={() => void copy()}
          {...props}
        >
          <motion.span
            key={copied ? "check" : "copy"}
            initial={reduceMotion ? false : { scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.12, ease: "easeOut" }}
            className="flex"
            aria-hidden="true"
          >
            {copied ? <Check /> : <Copy />}
          </motion.span>
        </Button>
      </motion.span>
    );
  },
);
CopyButton.displayName = "CopyButton";

export { CopyButton };
