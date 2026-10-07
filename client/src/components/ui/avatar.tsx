import { Avatar as BaseAvatar } from "@base-ui/react/avatar";
import * as React from "react";

import { cn } from "@/lib/utils";

/* Presence avatar on Base-UI primitives: photo (AvatarImage) with initials
 * fallback, optional presence dot. API unchanged (name/presence/initialsOf).
 *
 * Presence standard (change `custom-ui-avatar-group`, owner 2026-09-30):
 * solid status-color border + same color at 60% with blur
 * (the item-18 selected-day vocabulary): online = chart-2, offline =
 * destructive, inactive = muted fill with a muted-foreground edge (plain
 * muted vanishes as a border in light, 1.40:1 — card-07 lesson). The dot
 * lives OUTSIDE the clipped photo wrapper (`overflow-hidden` is inner-only),
 * `h-3 w-3` (DESIGN.md §4.5). */

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return (parts[0]?.slice(0, 2) ?? "?").toUpperCase();
  return `${parts[0]?.[0] ?? ""}${parts[parts.length - 1]?.[0] ?? ""}`.toUpperCase();
}

export type AvatarPresence = "online" | "offline" | "inactive" | null;

export interface AvatarProps extends Omit<React.ComponentPropsWithoutRef<typeof BaseAvatar.Root>, "children"> {
  name: string;
  src?: string;
  presence?: AvatarPresence;
}

const PRESENCE_CLASS: Record<Exclude<AvatarPresence, null>, string> = {
  online: "border-chart-2 bg-chart-2/60",
  offline: "border-destructive bg-destructive/60",
  inactive: "border-muted-foreground bg-muted/60",
};

const Avatar = React.forwardRef<HTMLSpanElement, AvatarProps>(
  ({ className, name, src, presence = null, ...props }, ref) => (
    <BaseAvatar.Root
      ref={ref}
      title={name}
      role="img"
      aria-label={presence ? `${name} (${presence})` : name}
      className={cn(
        "relative inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
        "bg-muted text-xs font-semibold text-foreground select-none",
        className,
      )}
      {...props}
    >
      <span className="flex h-full w-full items-center justify-center overflow-hidden rounded-full">
        {src && <BaseAvatar.Image src={src} alt="" className="h-full w-full object-cover" />}
        <BaseAvatar.Fallback className="flex h-full w-full items-center justify-center">
          {initialsOf(name)}
        </BaseAvatar.Fallback>
      </span>
      {presence && (
        <span
          aria-hidden="true"
          className={cn(
            "absolute right-0.5 -bottom-0 z-10 size-2 rounded-full border-2 backdrop-blur-sm",
            PRESENCE_CLASS[presence],
          )}
        />
      )}
    </BaseAvatar.Root>
  ),
);
Avatar.displayName = "Avatar";

export { Avatar, initialsOf };
