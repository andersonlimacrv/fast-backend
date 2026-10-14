/* Vendored from @animate-ui/primitives-animate-avatar-group (registry, 2026-09-30).
 * Local adaptations: 'use client' removed (Vite); tooltip from OUR COMPOSED
 * `custom-ui/components/tooltip/tooltip` (the same pill + arrow the sidebar
 * uses — owner 2026-09-30 — not the bare primitive); reduced-motion collapses
 * the hover shift (DESIGN.md §7). The standalone Arrow export is gone: our
 * composed Content already renders the arrow, like the sidebar (design
 * decision 1). Re-fetch from
 * https://animate-ui.com/r/primitives-animate-avatar-group.json to update. */

import * as React from "react";
import { motion, useReducedMotion, type HTMLMotionProps, type Transition } from "motion/react";

import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  type TooltipProviderProps,
  type TooltipProps,
  type TooltipContentProps,
} from "@/components/custom-ui/components/tooltip/tooltip";

type AvatarProps = Omit<HTMLMotionProps<"div">, "translate"> & {
  children: React.ReactNode;
  zIndex: number;
  translate?: string | number;
  /** Local delta: skip the Tooltip wrapper (an empty Tooltip still paints
   * the pill). Defaults to true, like the upstream. */
  tooltip?: boolean;
} & Omit<TooltipProps, "children">;

function AvatarContainer({
  zIndex,
  translate,
  tooltip = true,
  side,
  sideOffset,
  align,
  alignOffset,
  ...props
}: AvatarProps) {
  const reduceMotion = useReducedMotion();
  const body = (
    <motion.div
      data-slot="avatar-container"
      initial="initial"
      whileHover={reduceMotion ? undefined : "hover"}
      whileTap={reduceMotion ? undefined : "hover"}
      style={{ position: "relative", zIndex }}
    >
      <motion.div
        variants={{
          initial: { y: 0 },
          hover: { y: reduceMotion ? 0 : translate },
        }}
        {...props}
      />
    </motion.div>
  );
  if (!tooltip) return body;
  return (
    <Tooltip side={side} sideOffset={sideOffset} align={align} alignOffset={alignOffset}>
      <TooltipTrigger asChild>{body}</TooltipTrigger>
    </Tooltip>
  );
}

type AvatarGroupProps = Omit<React.ComponentProps<"div">, "translate"> & {
  children: React.ReactElement[];
  invertOverlap?: boolean;
  translate?: string | number;
  transition?: Transition;
  tooltipTransition?: Transition;
  /** Local delta (see AvatarProps): skip per-item Tooltips. */
  tooltip?: boolean;
} & Omit<TooltipProviderProps, "children"> &
  Omit<TooltipProps, "children">;

function AvatarGroup({
  ref,
  children,
  id,
  transition = { type: "spring", stiffness: 300, damping: 17 },
  invertOverlap = false,
  translate = "-30%",
  tooltip = true,
  openDelay = 0,
  closeDelay = 0,
  side = "top",
  sideOffset = 25,
  align = "center",
  alignOffset = 0,
  tooltipTransition = { type: "spring", stiffness: 300, damping: 35 },
  style,
  ...props
}: AvatarGroupProps) {
  return (
    <TooltipProvider
      id={id}
      openDelay={openDelay}
      closeDelay={closeDelay}
      transition={tooltipTransition}
    >
      <div
        ref={ref}
        data-slot="avatar-group"
        style={{
          display: "flex",
          alignItems: "center",
          ...style,
        }}
        {...props}
      >
        {children?.map((child, index) => (
          <AvatarContainer
            key={index}
            zIndex={invertOverlap ? React.Children.count(children) - index : index}
            transition={transition}
            translate={translate}
            tooltip={tooltip}
            side={side}
            sideOffset={sideOffset}
            align={align}
            alignOffset={alignOffset}
          >
            {child}
          </AvatarContainer>
        ))}
      </div>
    </TooltipProvider>
  );
}

type AvatarGroupTooltipProps = TooltipContentProps;

function AvatarGroupTooltip(props: AvatarGroupTooltipProps) {
  return <TooltipContent {...props} />;
}

export {
  AvatarGroup,
  AvatarGroupTooltip,
  type AvatarGroupProps,
  type AvatarGroupTooltipProps,
};
