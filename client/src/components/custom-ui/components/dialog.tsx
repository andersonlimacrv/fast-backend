/* Dialog (non-destructive content: create/edit/inspect), ported from the
 * upstream composed `components-base-dialog` — which sits on the
 * `primitives-base-dialog` choreography — onto our tokens.
 *
 * Lives in `/custom-ui` per the layers rule (pages consume custom-ui; the
 * shadcn base in `components/ui` stays untouched — debt §14 converged).
 *
 * From the composed component: the panel (upstream `DialogPopup`, here
 * `DialogContent`) with `showCloseButton` (default true — the X button with an
 * sr-only "Close") and `from` ("top" | "bottom" | "left" | "right"). The
 * `/ui` base has neither the close button nor the flip, hence this port.
 *
 * Layout follows the validated **AlertDialog** (03) for visual consistency
 * (owner, 2026-09-23) instead of the doc's own classes: panel `w-full max-w-md
 * rounded-lg border p-6 shadow-lg`, header `mb-4 gap-1.5`, title `text-lg
 * font-bold tracking-tight`, description `text-sm text-muted-foreground`,
 * footer `mt-5 flex-col-reverse gap-2 sm:flex-row sm:justify-end` (the doc
 * uses `grid gap-4 … sm:max-w-lg`, header `gap-2 text-center sm:text-left`,
 * title `leading-none font-semibold` and a marginless footer).
 *
 * Delta vs the upstream: the portal is gated by `AnimatePresence` so BOTH ends
 * animate — the backdrop fades (0.15s easeInOut + static `backdrop-blur-sm`)
 * and the popup enters/leaves with a 3D flip (`perspective(500px)` +
 * `rotateX|rotateY` from `from`, scale 0.8→1, 4px blur); spring 500/32 instead
 * of the upstream 150/25 (the owner's ~0.25s token, DESIGN.md §7). `from`
 * enters from `bottom` by default — the app-wide overlay convention
 * (DESIGN.md §7 guideline 6), as in the validated AlertDialog (03). Surface
 * `bg-card text-card-foreground`, close button focused with `ring-2`
 * (DESIGN.md §8), icons via `lib/icons`. Prefers-reduced-motion collapses
 * every animation to instant. */

import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type HTMLMotionProps,
  type Transition,
} from "motion/react";
import * as React from "react";

import { useControlledState } from "@/hooks/use-controlled-state";
import { getStrictContext } from "@/lib/get-strict-context";
import { X } from "@/lib/icons";
import { cn } from "@/lib/utils";

type DialogContextValue = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
};

const [DialogProvider, useDialog] = getStrictContext<DialogContextValue>("DialogContext");

const BACKDROP_TRANSITION: Transition = { duration: 0.15, ease: "easeInOut" };
/* Snappier than the upstream default (spring 150/25, ~0.33s settle): keeps the
 * spring character but lands in ~0.25s, inside DESIGN.md §7's 120–250ms band. */
const POPUP_TRANSITION: Transition = { type: "spring", stiffness: 500, damping: 32 };

export type DialogFlipFrom = "top" | "bottom" | "left" | "right";

type DialogProps = React.ComponentProps<typeof DialogPrimitive.Root>;

function Dialog({ open, defaultOpen, onOpenChange, ...props }: DialogProps) {
  const [isOpen, setIsOpen] = useControlledState({
    value: open,
    defaultValue: defaultOpen,
    onChange: onOpenChange as ((value: boolean) => void) | undefined,
  });

  // Base UI hands a second `eventDetails` argument; our context keeps the
  // plain `(open) => void` shape consumers expect.
  const handleOpenChange = React.useCallback((next: boolean) => setIsOpen(next), [setIsOpen]);

  return (
    <DialogProvider value={{ isOpen, setIsOpen }}>
      <DialogPrimitive.Root data-slot="dialog" {...props} open={isOpen} onOpenChange={handleOpenChange} />
    </DialogProvider>
  );
}

type DialogTriggerProps = React.ComponentProps<typeof DialogPrimitive.Trigger>;

function DialogTrigger(props: DialogTriggerProps) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />;
}

type DialogCloseProps = React.ComponentProps<typeof DialogPrimitive.Close>;

function DialogClose(props: DialogCloseProps) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />;
}

/** Mounted only while open (AnimatePresence holds it through the exit). */
function DialogPortal({ children, ...props }: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  const { isOpen } = useDialog();
  return (
    <AnimatePresence>
      {isOpen && (
        <DialogPrimitive.Portal data-slot="dialog-portal" keepMounted {...props}>
          {children}
        </DialogPrimitive.Portal>
      )}
    </AnimatePresence>
  );
}

type DialogOverlayProps = Omit<React.ComponentProps<typeof DialogPrimitive.Backdrop>, "render"> &
  HTMLMotionProps<"div">;

function DialogOverlay({ className, transition = BACKDROP_TRANSITION, ...props }: DialogOverlayProps) {
  const reduceMotion = useReducedMotion();
  return (
    <DialogPrimitive.Backdrop
      data-slot="dialog-backdrop"
      render={
        <motion.div
          key="dialog-backdrop"
          /* Upstream animates `filter: blur()` here, but on a flat black layer
           * that is invisible — the visible effect is `backdrop-blur`, which
           * frosts the page behind. Static blur + opacity fade (reduced-motion
           * keeps the blur, drops the fade). */
          className={cn("fixed inset-0 z-50 bg-black/50 backdrop-blur-sm", className)}
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reduceMotion ? undefined : { opacity: 0 }}
          transition={reduceMotion ? { duration: 0 } : transition}
          {...props}
        />
      }
    />
  );
}

type DialogContentProps = Omit<React.ComponentProps<typeof DialogPrimitive.Popup>, "render"> &
  HTMLMotionProps<"div"> & {
    /** Where the popup flips in from. App-wide default is `bottom`
     * (DESIGN.md §7): popping up from below reads better than dropping in. */
    from?: DialogFlipFrom;
    /** Renders the upstream close button (X) in the top-right corner. */
    showCloseButton?: boolean;
  };

function DialogContent({
  className,
  children,
  from = "bottom",
  showCloseButton = true,
  transition = POPUP_TRANSITION,
  ...props
}: DialogContentProps) {
  const reduceMotion = useReducedMotion();
  const initialRotation = from === "bottom" || from === "left" ? "20deg" : "-20deg";
  const rotateAxis = from === "top" || from === "bottom" ? "rotateX" : "rotateY";

  return (
    <DialogPortal>
      <DialogOverlay />
      {/* Viewport centers without CSS transforms, so the popup's own
       * perspective/rotate transform stays free for the flip. */}
      <DialogPrimitive.Viewport className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <DialogPrimitive.Popup
          data-slot="dialog-popup"
          render={
            <motion.div
              key="dialog-popup"
              className={cn(
                "relative w-full max-w-md rounded-lg border bg-card p-6 text-card-foreground shadow-lg outline-none",
                className,
              )}
              initial={
                reduceMotion
                  ? false
                  : {
                      opacity: 0,
                      filter: "blur(4px)",
                      transform: `perspective(500px) ${rotateAxis}(${initialRotation}) scale(0.8)`,
                    }
              }
              animate={{ opacity: 1, filter: "blur(0px)", transform: `perspective(500px) ${rotateAxis}(0deg) scale(1)` }}
              exit={
                reduceMotion
                  ? undefined
                  : {
                      opacity: 0,
                      filter: "blur(4px)",
                      transform: `perspective(500px) ${rotateAxis}(${initialRotation}) scale(0.8)`,
                    }
              }
              transition={reduceMotion ? { duration: 0 } : transition}
              {...props}
            >
              {children}
              {showCloseButton && (
                <DialogPrimitive.Close
                  data-slot="dialog-close-button"
                  className={cn(
                    "absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100",
                    "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                    "disabled:pointer-events-none",
                    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
                  )}
                >
                  <X />
                  <span className="sr-only">Close</span>
                </DialogPrimitive.Close>
              )}
            </motion.div>
          }
        />
      </DialogPrimitive.Viewport>
    </DialogPortal>
  );
}

const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("mb-4 flex flex-col gap-1.5", className)} {...props} />
);
DialogHeader.displayName = "DialogHeader";

const DialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className)} {...props} />
);
DialogFooter.displayName = "DialogFooter";

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title ref={ref} className={cn("text-lg font-bold tracking-tight", className)} {...props} />
));
DialogTitle.displayName = "DialogTitle";

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
DialogDescription.displayName = "DialogDescription";

export {
  Dialog,
  DialogTrigger,
  DialogClose,
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  useDialog,
};
