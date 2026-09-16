import * as React from "react";

import { cn } from "@/lib/utils";

/* Floating-label input ported from the Inputs reference (base variant:
 * token classes only, no motion dependency — the float is pure CSS peer). */

export interface FloatingInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

const FloatingInput = React.forwardRef<HTMLInputElement, FloatingInputProps>(
  ({ label, className, id, onFocus, onBlur, onChange, ...props }, ref) => {
    const [focused, setFocused] = React.useState(false);
    const [hasValue, setHasValue] = React.useState(false);
    const generatedId = React.useId();
    const inputId = id ?? generatedId;

    return (
      <div className="relative">
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "peer w-full rounded-md border border-input bg-input px-4 py-3 text-sm outline-none transition-colors",
            "placeholder:text-transparent focus:border-primary",
            className,
          )}
          placeholder=" "
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            setHasValue(e.target.value !== "");
            onBlur?.(e);
          }}
          onChange={(e) => {
            setHasValue(e.target.value !== "");
            onChange?.(e);
          }}
          {...props}
        />
        <label
          htmlFor={inputId}
          className={cn(
            "pointer-events-none absolute top-3 left-4 text-sm text-muted-foreground transition-all duration-150",
            "peer-focus:-top-2.5 peer-focus:left-3 peer-focus:bg-background peer-focus:px-1 peer-focus:text-xs peer-focus:text-primary",
            (focused || hasValue) && "-top-2.5 left-3 bg-background px-1 text-xs",
          )}
        >
          {label}
        </label>
      </div>
    );
  },
);
FloatingInput.displayName = "FloatingInput";

export { FloatingInput };
