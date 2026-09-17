import { Avatar as BaseAvatar } from "@base-ui/react/avatar";
import * as React from "react";

import { cn } from "@/lib/utils";

/* Presence avatar on Base-UI primitives: photo (AvatarImage) with initials
 * fallback, optional presence dot. API unchanged (name/presence/initialsOf). */

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return (parts[0]?.slice(0, 2) ?? "?").toUpperCase();
  return `${parts[0]?.[0] ?? ""}${parts[parts.length - 1]?.[0] ?? ""}`.toUpperCase();
}

export interface AvatarProps extends Omit<React.ComponentPropsWithoutRef<typeof BaseAvatar.Root>, "children"> {
  name: string;
  src?: string;
  presence?: "online" | "offline" | null;
}

const Avatar = React.forwardRef<HTMLSpanElement, AvatarProps>(
  ({ className, name, src, presence = null, ...props }, ref) => (
    <BaseAvatar.Root
      ref={ref}
      title={name}
      role="img"
      aria-label={presence ? `${name} (${presence})` : name}
      className={cn(
        "relative inline-flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full",
        "bg-muted text-xs font-semibold text-foreground select-none",
        className,
      )}
      {...props}
    >
      {src && <BaseAvatar.Image src={src} alt="" className="h-full w-full object-cover" />}
      <BaseAvatar.Fallback className="flex h-full w-full items-center justify-center">
        {initialsOf(name)}
      </BaseAvatar.Fallback>
      {presence && (
        <span
          aria-hidden="true"
          className={cn(
            "absolute -right-0.5 -bottom-0.5 z-10 h-2.5 w-2.5 rounded-full border-2 border-background",
            presence === "online" ? "bg-primary" : "bg-muted-foreground",
          )}
        />
      )}
    </BaseAvatar.Root>
  ),
);
Avatar.displayName = "Avatar";

export { Avatar, initialsOf };
