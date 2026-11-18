import { forwardRef, useState } from "react";
import type { InputHTMLAttributes } from "react";

import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "@/lib/icons";
import { cn } from "@/lib/utils";

/** Password input with an accessible show/hide toggle (keeps RHF refs intact). */
export const PasswordInput = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => {
    const [visible, setVisible] = useState(false);
    return (
      <div className="relative">
        <Input ref={ref} type={visible ? "text" : "password"} className={cn("pr-11", className)} {...props} />
        <button
          type="button"
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          onClick={() => setVisible((value) => !value)}
          className={cn(
            "absolute inset-y-0 right-0 flex w-10 items-center justify-center rounded-r-md text-muted-foreground",
            "transition-colors hover:text-foreground",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          )}
        >
          {visible ? <EyeOff className="size-4" aria-hidden="true" /> : <Eye className="size-4" aria-hidden="true" />}
        </button>
      </div>
    );
  },
);
PasswordInput.displayName = "PasswordInput";
