/* Alert dialog (destructive confirmations), ported from the upstream
 * `primitives-base-alert-dialog` choreography onto our tokens.
 *
 * Lives in `/custom-ui` per the layers rule (pages consume custom-ui; the
 * shadcn base in `components/ui` stays untouched — debt §14).
 *
 * Delta vs the base: the portal is gated by `AnimatePresence` so BOTH ends
 * animate — the backdrop fades with a 4px blur and the popup enters/leaves
 * with a 3D flip (`perspective(500px)` + `rotateX|rotateY` from `from`,
 * scale 0.8→1) plus the same blur. Spring 500/32 (faster than the upstream
 * 150/25 per the owner: ~0.25s settle), blur capped at 4px. The flip enters
 * from `bottom` by default — the app-wide convention (DESIGN.md §7).
 * Prefers-reduced-motion collapses every animation to instant. */

import { AlertDialog as AlertDialogPrimitive } from "@base-ui/react/alert-dialog";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type HTMLMotionProps,
  type Transition,
} from "motion/react";
import * as React from "react";

import { buttonVariants } from "@/components/ui/button";
import { useControlledState } from "@/hooks/use-controlled-state";
import { getStrictContext } from "@/lib/get-strict-context";
import { cn } from "@/lib/utils";

type AlertDialogContextValue = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
};

const [AlertDialogProvider, useAlertDialog] = getStrictContext<AlertDialogContextValue>("AlertDialogContext");

const BACKDROP_TRANSITION: Transition = { duration: 0.15, ease: "easeInOut" };
/* Snappier than the upstream default (spring 150/25, ~0.33s settle): keeps the
 * spring character but lands in ~0.25s, inside DESIGN.md §7's 120–250ms band. */
const POPUP_TRANSITION: Transition = { type: "spring", stiffness: 500, damping: 32 };

export type AlertDialogFlipFrom = "top" | "bottom" | "left" | "right";

type AlertDialogProps = React.ComponentProps<typeof AlertDialogPrimitive.Root>;

function AlertDialog({ open, defaultOpen, onOpenChange, ...props }: AlertDialogProps) {
  const [isOpen, setIsOpen] = useControlledState({
    value: open,
    defaultValue: defaultOpen,
    onChange: onOpenChange as ((value: boolean) => void) | undefined,
  });

  // Base UI hands a second `eventDetails` argument; our context keeps the
  // plain `(open) => void` shape consumers expect.
  const handleOpenChange = React.useCallback((next: boolean) => setIsOpen(next), [setIsOpen]);

  return (
    <AlertDialogProvider value={{ isOpen, setIsOpen }}>
      <AlertDialogPrimitive.Root data-slot="alert-dialog" {...props} open={isOpen} onOpenChange={handleOpenChange} />
    </AlertDialogProvider>
  );
}

type AlertDialogTriggerProps = React.ComponentProps<typeof AlertDialogPrimitive.Trigger>;

function AlertDialogTrigger(props: AlertDialogTriggerProps) {
  return <AlertDialogPrimitive.Trigger data-slot="alert-dialog-trigger" {...props} />;
}

/** Mounted only while open (AnimatePresence holds it through the exit). */
function AlertDialogPortal({ children, ...props }: React.ComponentProps<typeof AlertDialogPrimitive.Portal>) {
  const { isOpen } = useAlertDialog();
  return (
    <AnimatePresence>
      {isOpen && (
        <AlertDialogPrimitive.Portal data-slot="alert-dialog-portal" keepMounted {...props}>
          {children}
        </AlertDialogPrimitive.Portal>
      )}
    </AnimatePresence>
  );
}

type AlertDialogOverlayProps = Omit<React.ComponentProps<typeof AlertDialogPrimitive.Backdrop>, "render"> &
  HTMLMotionProps<"div">;

function AlertDialogOverlay({ className, transition = BACKDROP_TRANSITION, ...props }: AlertDialogOverlayProps) {
  const reduceMotion = useReducedMotion();
  return (
    <AlertDialogPrimitive.Backdrop
      data-slot="alert-dialog-backdrop"
      render={
        <motion.div
          key="alert-dialog-backdrop"
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

type AlertDialogContentProps = Omit<React.ComponentProps<typeof AlertDialogPrimitive.Popup>, "render"> &
  HTMLMotionProps<"div"> & {
    /** Where the popup flips in from. App-wide default is `bottom`
     * (DESIGN.md §7): popping up from below reads better than dropping in. */
    from?: AlertDialogFlipFrom;
  };

function AlertDialogContent({
  className,
  children,
  from = "bottom",
  transition = POPUP_TRANSITION,
  ...props
}: AlertDialogContentProps) {
  const reduceMotion = useReducedMotion();
  const initialRotation = from === "bottom" || from === "left" ? "20deg" : "-20deg";
  const rotateAxis = from === "top" || from === "bottom" ? "rotateX" : "rotateY";

  return (
    <AlertDialogPortal>
      <AlertDialogOverlay />
      {/* Viewport centers without CSS transforms, so the popup's own
       * perspective/rotate transform stays free for the flip. */}
      <AlertDialogPrimitive.Viewport className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <AlertDialogPrimitive.Popup
          data-slot="alert-dialog-popup"
          render={
            <motion.div
              key="alert-dialog-popup"
              className={cn(
                "w-full max-w-md rounded-lg border bg-card p-6 text-card-foreground shadow-lg outline-none",
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
            </motion.div>
          }
        />
      </AlertDialogPrimitive.Viewport>
    </AlertDialogPortal>
  );
}

const AlertDialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("mb-4 flex flex-col gap-1.5", className)} {...props} />
);
AlertDialogHeader.displayName = "AlertDialogHeader";

const AlertDialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className)} {...props} />
);
AlertDialogFooter.displayName = "AlertDialogFooter";

const AlertDialogTitle = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Title ref={ref} className={cn("text-lg font-bold tracking-tight", className)} {...props} />
));
AlertDialogTitle.displayName = "AlertDialogTitle";

const AlertDialogDescription = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
AlertDialogDescription.displayName = "AlertDialogDescription";

const AlertDialogAction = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Close>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Close> & {
    variant?: "default" | "destructive";
  }
>(({ className, variant = "default", ...props }, ref) => (
  <AlertDialogPrimitive.Close ref={ref} className={cn(buttonVariants({ variant }), className)} {...props} />
));
AlertDialogAction.displayName = "AlertDialogAction";

const AlertDialogCancel = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Close>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Close>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Close ref={ref} className={cn(buttonVariants({ variant: "outline" }), className)} {...props} />
));
AlertDialogCancel.displayName = "AlertDialogCancel";

export {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
  useAlertDialog,
};
