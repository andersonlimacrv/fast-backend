import { motion, useReducedMotion, type Transition } from "motion/react";
import * as React from "react";

import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

/* Overlapping presence avatar group (upstream user-presence behaviour,
 * our Avatar + tokens). Motion covers order/presence changes. */

export interface AvatarGroupUser {
  name: string;
  presence?: "online" | "offline" | null;
}

export interface AvatarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  users: AvatarGroupUser[];
  max?: number;
  size?: "sm" | "md";
}

const GROUP_TRANSITION: Transition = { type: "spring", stiffness: 150, damping: 22 };

const SIZE_CLASS = {
  sm: "h-6 w-6 text-[10px]",
  md: "h-8 w-8 text-xs",
} as const;

export function AvatarGroup({ users, max = 4, size = "md", className, ...props }: AvatarGroupProps) {
  const reduceMotion = useReducedMotion();
  const visible = users.slice(0, max);
  const overflow = users.length - visible.length;
  const online = users.filter((u) => u.presence === "online").length;

  return (
    <div role="group" aria-label={`${online} online`} className={cn("flex items-center", className)} {...props}>
      {visible.map((user) => (
        <motion.span
          key={user.name}
          layout={!reduceMotion}
          initial={reduceMotion ? false : { opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={reduceMotion ? { duration: 0 } : GROUP_TRANSITION}
          className="-ml-2 shrink-0 first:ml-0"
        >
          <Avatar
            name={user.name}
            presence={user.presence}
            className={cn(SIZE_CLASS[size], "ring-2 ring-background")}
          />
        </motion.span>
      ))}
      {overflow > 0 && (
        <span
          aria-hidden="true"
          title={`${overflow} more`}
          className={cn(
            "-ml-2 inline-flex shrink-0 items-center justify-center rounded-full",
            "bg-muted font-semibold text-muted-foreground ring-2 ring-background",
            SIZE_CLASS[size],
          )}
        >
          +{overflow}
        </span>
      )}
    </div>
  );
}
