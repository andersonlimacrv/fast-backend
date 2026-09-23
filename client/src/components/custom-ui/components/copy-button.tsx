import { cva, type VariantProps } from "class-variance-authority";
import { AnimatePresence, motion, useReducedMotion, type HTMLMotionProps } from "motion/react";
import * as React from "react";

import { useControlledState } from "@/hooks/use-controlled-state";
import { Check, Copy } from "@/lib/icons";
import { cn } from "@/lib/utils";

/* Copy button — composed port of the upstream `components-buttons-copy`
 * (change custom-ui-copy-button): a square icon button with the site's
 * variant/size `cva`, `content`/`copied`/`onCopiedChange`/`delay` (3000ms) and
 * the signature icon swap — `AnimatePresence mode="popLayout"` cross-fading the
 * copy/check glyphs with scale + blur (0.25s) instead of the previous plain
 * fade-in. Hover/tap scales come from the upstream button primitive
 * (`tapScale` 0.95 kept; the `hoverScale` 1.05 was dropped on owner request).
 *
 * Local deltas: focus ring `ring-2` (DESIGN.md §8; the site uses 3px at 50%),
 * glyphs from `lib/icons` (golden rule — no direct lucide import in pages), no
 * `console.error` when the clipboard is denied, and the reset timer is cleared
 * on unmount (the upstream leaks it). The element is a plain `motion.button`
 * (the upstream Slot/asChild is not needed by any consumer) and inline
 * production usage passes `variant="ghost"` explicitly to stay subtle next to
 * IDs. */

const copyButtonVariants = cva(
  [
    "flex items-center justify-center rounded-md shrink-0",
    "transition-[box-shadow,_color,_background-color,_border-color,_outline-color,_text-decoration-color,_fill,_stroke]",
    "disabled:pointer-events-none disabled:opacity-50",
    "[&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0",
    "outline-none focus-visible:ring-2 focus-visible:ring-ring",
    "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  ].join(" "),
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
        accent: "bg-accent text-accent-foreground shadow-xs hover:bg-accent/90",
        destructive: "bg-destructive text-white shadow-xs hover:bg-destructive/90 dark:bg-destructive/60",
        outline:
          "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary: "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "size-9",
        xs: "size-7 [&_svg:not([class*='size-'])]:size-3.5 rounded-md",
        sm: "size-8 rounded-md",
        lg: "size-10 rounded-md",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface CopyButtonProps
  extends Omit<HTMLMotionProps<"button">, "children">,
    VariantProps<typeof copyButtonVariants> {
  content: string;
  copied?: boolean;
  onCopiedChange?: (copied: boolean, content?: string) => void;
  /** How long the check stays before resetting (ms). */
  delay?: number;
  /** Press scale (default 0.95). The upstream `hoverScale` is intentionally not exposed. */
  tapScale?: number;
}

function CopyButton({
  className,
  content,
  copied,
  onCopiedChange,
  onClick,
  variant,
  size,
  delay = 3000,
  tapScale = 0.95,
  ...props
}: CopyButtonProps) {
  const reduceMotion = useReducedMotion();
  const [isCopied, setIsCopied] = useControlledState({
    value: copied,
    defaultValue: false,
    onChange: onCopiedChange as ((value: boolean, content?: string) => void) | undefined,
  });
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const handleCopy = (event: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);
    if (isCopied || !content) return;
    navigator.clipboard
      ?.writeText(content)
      .then(() => {
        setIsCopied(true, content);
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(() => setIsCopied(false, content), delay);
      })
      .catch(() => {
        /* Clipboard denied (permissions/insecure context): stay on the copy icon. */
      });
  };

  return (
    <motion.button
      type="button"
      data-slot="copy-button"
      aria-label={isCopied ? "Copied" : "Copy to clipboard"}
      aria-live="polite"
      className={cn(copyButtonVariants({ variant, size }), className)}
      /* Press feedback only: the upstream `hoverScale` (1.05) was dropped on
       * owner request (2026-09-19) — the button no longer grows under the
       * cursor, matching the Checkbox decision. */
      whileTap={reduceMotion ? undefined : { scale: tapScale }}
      onClick={handleCopy}
      {...props}
    >
      <AnimatePresence mode="popLayout">
        <motion.span
          key={isCopied ? "check" : "copy"}
          data-slot="copy-button-icon"
          className="flex"
          aria-hidden="true"
          initial={reduceMotion ? false : { scale: 0, opacity: 0.4, filter: "blur(4px)" }}
          animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
          exit={reduceMotion ? undefined : { scale: 0, opacity: 0.4, filter: "blur(4px)" }}
          transition={{ duration: reduceMotion ? 0 : 0.25 }}
        >
          {isCopied ? <Check /> : <Copy />}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  );
}

export { CopyButton };
