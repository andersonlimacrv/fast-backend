/* Composed AvatarGroup (change `custom-ui-avatar-group`): the upstream primitive
 * set with our mold — our `ui/avatar` (photo + initials + presence dot) per
 * user, tooltip with the name only, our `max`/`+N` overflow.
 *
 * Explicit API with defaults (owner 2026-09-30): `mode` (multiple|single),
 * `onHover` (rise effect, multiple only), `tooltip` (per-avatar name tooltip;
 * in single mode the avatar is bare — tooltip only, no shift), `showPresence`
 * (default off). */

import * as React from "react";

import { Avatar, type AvatarPresence } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import {
  AvatarGroup as AvatarGroupPrimitive,
  AvatarGroupTooltip as AvatarGroupTooltipPrimitive,
  type AvatarGroupProps as AvatarGroupPrimitiveProps,
} from "./primitive";

export interface AvatarGroupUser {
  name: string;
  src?: string;
  presence?: AvatarPresence;
}

interface AvatarGroupBaseProps
  extends Omit<AvatarGroupPrimitiveProps, "children" | "translate"> {
  onHover?: boolean;
  tooltip?: boolean;
  showPresence?: boolean;
  max?: number;
  size?: "sm" | "md";
}

export interface AvatarGroupMultipleProps extends AvatarGroupBaseProps {
  mode?: "multiple";
  users: AvatarGroupUser[];
  user?: never;
}

export interface AvatarGroupSingleProps extends AvatarGroupBaseProps {
  mode: "single";
  user: AvatarGroupUser;
  users?: never;
  max?: never;
}

export type AvatarGroupProps = AvatarGroupMultipleProps | AvatarGroupSingleProps;

const SIZE_CLASS = {
  sm: "h-6 w-6 text-[10px]",
  md: "h-8 w-8 text-xs",
} as const;

function GroupAvatar({
  user,
  size,
  showPresence,
  tooltip,
}: {
  user: AvatarGroupUser;
  size: "sm" | "md";
  showPresence: boolean;
  tooltip: boolean;
}) {
  return (
    <React.Fragment>
      <Avatar
        name={user.name}
        src={user.src}
        presence={showPresence ? (user.presence ?? null) : null}
        className={cn(SIZE_CLASS[size], "ring-2 ring-background")}
      />
      {tooltip ? <AvatarGroupTooltipPrimitive>{user.name}</AvatarGroupTooltipPrimitive> : null}
    </React.Fragment>
  );
}

function AvatarGroup(props: AvatarGroupProps) {
  const { onHover = true, tooltip = true, showPresence = false, size = "md", className } = props;

  if (props.mode === "single") {
    const { user, ...passThrough } = props;
    // Strip our own keys before passing through to the primitive.
    const { mode: _mode, users: _users, max: _max, onHover: _h, tooltip: _t, showPresence: _s, size: _size, className: _c, ...rest } = passThrough;
    void [_mode, _users, _max, _h, _t, _s, _size, _c];
    const avatar = (
      <Avatar
        name={user.name}
        src={user.src}
        presence={showPresence ? (user.presence ?? null) : null}
        className={cn(SIZE_CLASS[size], "ring-2 ring-background", className)}
      />
    );
    if (!tooltip) return avatar;
    return (
      <AvatarGroupPrimitive translate={0} {...rest}>
        {[
          <React.Fragment key={user.name}>
            {avatar}
            <AvatarGroupTooltipPrimitive>{user.name}</AvatarGroupTooltipPrimitive>
          </React.Fragment>,
        ]}
      </AvatarGroupPrimitive>
    );
  }

  const { users, max = 4, ...passThrough } = props;
  const { mode: _mode, user: _user, onHover: _h, tooltip: _t, showPresence: _s, size: _size, className: _c, ...rest } = passThrough;
  void [_mode, _user, _h, _t, _s, _size, _c];
  const visible = users.slice(0, max);
  const overflow = users.length - visible.length;
  const online = users.filter((u) => u.presence === "online").length;

  return (
    <div role="group" aria-label={`${online} online`} className={cn("flex items-center", className)}>
      <AvatarGroupPrimitive translate={onHover ? undefined : 0} tooltip={tooltip} {...rest}>
        {visible.map((user) => (
          <GroupAvatar
            key={user.name}
            user={user}
            size={size}
            showPresence={showPresence}
            tooltip={tooltip}
          />
        ))}
      </AvatarGroupPrimitive>
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

export { AvatarGroup, type AvatarGroupUser as AvatarGroupUserType };
