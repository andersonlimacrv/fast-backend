import { Dialog } from "@base-ui/react/dialog";
import { motion, useReducedMotion } from "motion/react";
import * as React from "react";

import { cn } from "@/lib/utils";

/* Dialog on Base UI primitives (non-blocking CRUD create/edit).
 * Same shell as ui/alert-dialog; use AlertDialog for destructive confirms. */

const DialogRoot = Dialog.Root;
const DialogTrigger = Dialog.Trigger;
const DialogPortal = Dialog.Portal;

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof Dialog.Backdrop>,
  React.ComponentPropsWithoutRef<typeof Dialog.Backdrop>
>(({ className, ...props }, ref) => (
  <Dialog.Backdrop ref={ref} className={cn("fixed inset-0 z-50 bg-black/50", className)} {...props} />
));
DialogOverlay.displayName = "DialogOverlay";

const DialogContent = React.forwardRef<
  React.ElementRef<typeof Dialog.Popup>,
  React.ComponentPropsWithoutRef<typeof Dialog.Popup>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPopup ref={ref} className={className} {...props}>
      {children}
    </DialogPopup>
  </DialogPortal>
));
DialogContent.displayName = "DialogContent";

const DialogPopup = React.forwardRef<
  React.ElementRef<typeof Dialog.Popup>,
  React.ComponentPropsWithoutRef<typeof Dialog.Popup>
>(({ className, children, ...props }, ref) => {
  const reduceMotion = useReducedMotion();
  return (
    <Dialog.Popup
      ref={ref}
      className={cn(
        "fixed top-1/2 left-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2",
        "rounded-lg border bg-card p-6 text-card-foreground shadow-lg",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
        className,
      )}
      {...props}
    >
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.15, ease: "easeOut" }}
      >
        {children}
      </motion.div>
    </Dialog.Popup>
  );
});
DialogPopup.displayName = "DialogPopup";

const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("mb-4 flex flex-col gap-1.5", className)} {...props} />
);
DialogHeader.displayName = "DialogHeader";

const DialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className)} {...props} />
);
DialogFooter.displayName = "DialogFooter";

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof Dialog.Title>,
  React.ComponentPropsWithoutRef<typeof Dialog.Title>
>(({ className, ...props }, ref) => (
  <Dialog.Title ref={ref} className={cn("text-lg font-bold tracking-tight", className)} {...props} />
));
DialogTitle.displayName = "DialogTitle";

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof Dialog.Description>,
  React.ComponentPropsWithoutRef<typeof Dialog.Description>
>(({ className, ...props }, ref) => (
  <Dialog.Description ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
));
DialogDescription.displayName = "DialogDescription";

const DialogClose = Dialog.Close;

export {
  DialogRoot as Dialog,
  DialogTrigger,
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
};
