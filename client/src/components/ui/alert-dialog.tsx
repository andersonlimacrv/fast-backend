import { AlertDialog } from "@base-ui/react/alert-dialog";
import { motion, useReducedMotion } from "motion/react";
import * as React from "react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/* Alert dialog on Base UI primitives (destructive confirmations).
 * Replaces `notify.confirm` toasts where a blocking choice is safer;
 * toasts stay for fire-and-forget feedback. */

const AlertDialogRoot = AlertDialog.Root;
const AlertDialogTrigger = AlertDialog.Trigger;

const AlertDialogPortal = AlertDialog.Portal;

const AlertDialogOverlay = React.forwardRef<
  React.ElementRef<typeof AlertDialog.Backdrop>,
  React.ComponentPropsWithoutRef<typeof AlertDialog.Backdrop>
>(({ className, ...props }, ref) => (
  <AlertDialog.Backdrop ref={ref} className={cn("fixed inset-0 z-50 bg-black/50", className)} {...props} />
));
AlertDialogOverlay.displayName = "AlertDialogOverlay";

const AlertDialogContent = React.forwardRef<
  React.ElementRef<typeof AlertDialog.Popup>,
  React.ComponentPropsWithoutRef<typeof AlertDialog.Popup>
>(({ className, children, ...props }, ref) => {
  const reduceMotion = useReducedMotion();
  return (
    <AlertDialogPortal>
      <AlertDialogOverlay />
      <AlertDialog.Popup
        ref={ref}
        className={cn(
          "fixed top-1/2 left-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2",
          "rounded-lg border bg-card p-6 text-card-foreground shadow-lg outline-none",
          className,
        )}
        {...props}
      >
        <motion.div
          /* Upstream spring enter (stiffness ~350, damping ~30 settles <250ms). */
          initial={reduceMotion ? false : { opacity: 0, scale: 0.96, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 350, damping: 30 }}
        >
          {children}
        </motion.div>
      </AlertDialog.Popup>
    </AlertDialogPortal>
  );
});
AlertDialogContent.displayName = "AlertDialogContent";

const AlertDialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("mb-4 flex flex-col gap-1.5", className)} {...props} />
);
AlertDialogHeader.displayName = "AlertDialogHeader";

const AlertDialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className)} {...props} />
);
AlertDialogFooter.displayName = "AlertDialogFooter";

const AlertDialogTitle = React.forwardRef<
  React.ElementRef<typeof AlertDialog.Title>,
  React.ComponentPropsWithoutRef<typeof AlertDialog.Title>
>(({ className, ...props }, ref) => (
  <AlertDialog.Title ref={ref} className={cn("text-lg font-bold tracking-tight", className)} {...props} />
));
AlertDialogTitle.displayName = "AlertDialogTitle";

const AlertDialogDescription = React.forwardRef<
  React.ElementRef<typeof AlertDialog.Description>,
  React.ComponentPropsWithoutRef<typeof AlertDialog.Description>
>(({ className, ...props }, ref) => (
  <AlertDialog.Description ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
));
AlertDialogDescription.displayName = "AlertDialogDescription";

const AlertDialogAction = React.forwardRef<
  React.ElementRef<typeof AlertDialog.Close>,
  React.ComponentPropsWithoutRef<typeof AlertDialog.Close> & {
    variant?: "default" | "destructive";
  }
>(({ className, variant = "default", ...props }, ref) => (
  <AlertDialog.Close ref={ref} className={cn(buttonVariants({ variant }), className)} {...props} />
));
AlertDialogAction.displayName = "AlertDialogAction";

const AlertDialogCancel = React.forwardRef<
  React.ElementRef<typeof AlertDialog.Close>,
  React.ComponentPropsWithoutRef<typeof AlertDialog.Close>
>(({ className, ...props }, ref) => (
  <AlertDialog.Close ref={ref} className={cn(buttonVariants({ variant: "outline" }), className)} {...props} />
));
AlertDialogCancel.displayName = "AlertDialogCancel";

export {
  AlertDialogRoot as AlertDialog,
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
};
