import { Dialog } from "@base-ui/react/dialog";
import { X } from "lucide-react";

import { LoginForm } from "@/components/login-form";
import { cn } from "@/lib/utils";

/** Email-first login dialog for the landing page (Base-UI: focus + Esc handled). */
export function LoginModal({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/50" />
        <Dialog.Popup
          className={cn(
            "fixed top-1/2 left-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2",
            "rounded-lg border bg-card p-6 text-card-foreground shadow-lg outline-none",
          )}
        >
          <div className="mb-4 flex items-start justify-between gap-2">
            <div>
              <Dialog.Title className="text-lg font-bold tracking-tight">Login</Dialog.Title>
              <Dialog.Description className="mt-1 text-sm text-muted-foreground">
                Email first — the password step always follows.
              </Dialog.Description>
            </div>
            <Dialog.Close
              className="shrink-0 rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              aria-label="Close login"
            >
              <X className="h-4 w-4" />
            </Dialog.Close>
          </div>
          <LoginForm onDone={() => onOpenChange(false)} />
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
