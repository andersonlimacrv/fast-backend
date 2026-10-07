import * as React from "react";

import { cn } from "@/lib/utils";

/* Floating-label input ported from the Inputs reference (base variant:
 * token classes only, no motion dependency — the float is pure CSS peer).
 *
 * Notch (change `custom-ui-inputs`, owner 2026-09-30 — MDC notched-outline
 * structure): the top edge is split into leading stub + measured gap +
 * trailing segment, so the floated label needs NO background chip and the
 * field is seamless on ANY surface (a chip always patches somewhere). The gap
 * tracks the label width (ResizeObserver mold); `hasValue` starts from
 * `value`/`defaultValue` so prefilled inputs open floated. */

export interface FloatingInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

const NOTCH_PAD = 8;

const FloatingInput = React.forwardRef<HTMLInputElement, FloatingInputProps>(
  ({ label, className, id, disabled, onFocus, onBlur, onChange, ...props }, ref) => {
    const [focused, setFocused] = React.useState(false);
    const initial = props.value ?? props.defaultValue;
    const [hasValue, setHasValue] = React.useState(
      () => initial != null && String(initial) !== "",
    );
    const generatedId = React.useId();
    const inputId = id ?? generatedId;
    const labelRef = React.useRef<HTMLLabelElement>(null);
    const [notch, setNotch] = React.useState(0);

    const floated = focused || hasValue;

    React.useEffect(() => {
      const el = labelRef.current;
      if (!el || typeof ResizeObserver === "undefined") return;
      const measure = () => setNotch(el.offsetWidth);
      measure();
      const ro = new ResizeObserver(measure);
      ro.observe(el);
      return () => ro.disconnect();
    }, []);

    return (
      <div className="group relative">
        <input
          ref={ref}
          id={inputId}
          disabled={disabled}
          className={cn(
            "peer w-full rounded-md rounded-t-none border border-t-0 border-input bg-transparent px-4 py-3 text-sm outline-none transition-colors",
            "placeholder:text-transparent focus:border-primary disabled:cursor-not-allowed disabled:opacity-50",
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
        {/* Notched top edge: leading stub + measured gap + trailing segment.
          After the input (visual order via absolute); states via `group-*`
          and the `disabled` prop — `peer-*` can't reach nested spans. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 flex"
        >
          <span
            className={cn(
              "h-0 w-2 rounded-tl-md border-t border-input group-focus-within:border-primary",
              disabled && "opacity-50",
            )}
          />
          <span
            data-slot="input-notch"
            className={cn(
              "h-0 transition-[width] duration-100 ease-out motion-reduce:transition-none",
              !floated && "delay-75",
            )}
            style={{ width: floated ? notch + NOTCH_PAD : 0 }}
          />
          <span
            className={cn(
              "h-0 min-w-2 flex-1 rounded-tr-md border-t border-input group-focus-within:border-primary",
              disabled && "opacity-50",
            )}
          />
        </div>
        <label
          ref={labelRef}
          htmlFor={inputId}
          className={cn(
            "pointer-events-none absolute top-3 left-4 bg-transparent text-sm text-muted-foreground transition-all duration-150 motion-reduce:transition-none",
            "peer-focus:-top-2.5 peer-focus:left-3 peer-focus:text-xs peer-focus:text-primary",
            floated && "-top-2.5 left-3 text-xs",
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
