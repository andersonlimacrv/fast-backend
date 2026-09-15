import * as React from "react";

import { cn } from "@/lib/utils";

/* Presence avatar: initials on tokens, optional presence dot. */

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return (parts[0]?.slice(0, 2) ?? "?").toUpperCase();
  return `${parts[0]?.[0] ?? ""}${parts[parts.length - 1]?.[0] ?? ""}`.toUpperCase();
}

export interface AvatarProps extends React.HTMLAttributes<HTMLSpanElement> {
  name: string;
  presence?: "online" | "offline" | null;
}

const Avatar = React.forwardRef<HTMLSpanElement, AvatarProps>(
  ({ className, name, presence = null, ...props }, ref) => (
    <span
      ref={ref}
      title={name}
      aria-label={presence ? `${name} (${presence})` : name}
      role="img"
      className={cn(
        "relative inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
        "bg-muted text-xs font-semibold text-muted-foreground select-none",
        className,
      )}
      {...props}
    >
      {initialsOf(name)}
      {presence && (
        <span
          aria-hidden="true"
          className={cn(
            "absolute -right-0.5 -bottom-0.5 h-2.5 w-2.5 rounded-full border-2 border-background",
            presence === "online" ?           "bg-primary" : "bg-muted-foreground",
          )}
        />
      )}
    </span>
  ),
);
Avatar.displayName = "Avatar";

export { Avatar, initialsOf };
