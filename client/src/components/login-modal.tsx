import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/custom-ui/components/dialog";

import { LoginForm } from "@/components/login-form";

/**
 * Email-first login dialog for the landing page. Uses the app-wide overlay
 * choreography (`custom-ui/dialog`, flip from bottom — DESIGN.md §7.6), so
 * focus, Esc, backdrop and reduced-motion are handled by the primitive.
 */
export function LoginModal({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Welcome back</DialogTitle>
          <DialogDescription>Sign in with email or your identity provider.</DialogDescription>
        </DialogHeader>
        <LoginForm onDone={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}
