import { motion } from "motion/react";
import * as React from "react";

import { Check, Copy } from "@/lib/icons";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/* Copy button: clipboard write with icon-swap feedback.
 * Adapted from references (lucide instead of react-icons, no hover gymnastics). */

export interface CopyButtonProps extends Omit<React.ComponentPropsWithoutRef<typeof Button>, "onClick" | "children"> {
  content: string;
  delay?: number;
  onCopiedChange?: (copied: boolean, content?: string) => void;
}

const CopyButton = React.forwardRef<React.ElementRef<typeof Button>, CopyButtonProps>(
  ({ className, content, delay = 3000, onCopiedChange, variant = "ghost", size = "icon", ...props }, ref) => {
    const [copied, setCopied] = React.useState(false);
    const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

    React.useEffect(
      () => () => {
        if (timer.current) clearTimeout(timer.current);
      },
      [],
    );

    const copy = async () => {
      try {
        await navigator.clipboard.writeText(content);
      } catch {
        return;
      }
      setCopied(true);
      onCopiedChange?.(true, content);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        setCopied(false);
        onCopiedChange?.(false, content);
      }, delay);
    };

    return (
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
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.12, ease: "easeOut" }}
          className="flex"
          aria-hidden="true"
        >
          {copied ? <Check /> : <Copy />}
        </motion.span>
      </Button>
    );
  },
);
CopyButton.displayName = "CopyButton";

export { CopyButton };
