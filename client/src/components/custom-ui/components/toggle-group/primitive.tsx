/* Vendored from @animate-ui/primitives-radix-toggle-group (registry, 2026-09-23).
 * Local adaptations: 'use client' removed (Vite); reduced-motion collapses
 * the item press scale (the upstream animates unconditionally — the Highlight
 * itself already handles reduced motion internally). Re-fetch from
 * https://animate-ui.com/r/primitives-radix-toggle-group.json to update. */

import * as React from "react";
import { ToggleGroup as ToggleGroupPrimitive } from "radix-ui";
import { AnimatePresence, motion, useReducedMotion, type HTMLMotionProps } from "motion/react";

import {
  Highlight,
  HighlightItem,
  type HighlightItemProps,
  type HighlightProps,
} from "@/components/custom-ui/effects/highlight";
import { getStrictContext } from "@/lib/get-strict-context";
import { useControlledState } from "@/hooks/use-controlled-state";

type ToggleGroupContextType = {
  value: string | string[] | undefined;
  setValue: (value: string | string[] | undefined) => void;
  type: "single" | "multiple";
};

const [ToggleGroupProvider, useToggleGroup] = getStrictContext<ToggleGroupContextType>("ToggleGroupContext");

type ToggleGroupProps = React.ComponentProps<typeof ToggleGroupPrimitive.Root>;

function ToggleGroup(props: ToggleGroupProps) {
  const [value, setValue] = useControlledState<string | string[] | undefined>({
    value: props.value,
    defaultValue: props.defaultValue,
    onChange: props.onValueChange as (value: string | string[] | undefined) => void,
  });

  return (
    <ToggleGroupProvider value={{ value, setValue, type: props.type }}>
      <ToggleGroupPrimitive.Root data-slot="toggle-group" {...props} onValueChange={setValue} />
    </ToggleGroupProvider>
  );
}

type ToggleGroupItemProps = Omit<React.ComponentProps<typeof ToggleGroupPrimitive.Item>, "asChild"> &
  HTMLMotionProps<"button">;

function ToggleGroupItem({ value, disabled, ...props }: ToggleGroupItemProps) {
  const reduceMotion = useReducedMotion();
  return (
    <ToggleGroupPrimitive.Item value={value} disabled={disabled} asChild>
      <motion.button
        data-slot="toggle-group-item"
        whileTap={reduceMotion ? undefined : { scale: 0.95 }}
        {...props}
      />
    </ToggleGroupPrimitive.Item>
  );
}

type ToggleGroupHighlightProps = Omit<HighlightProps, "controlledItems">;

function ToggleGroupHighlight({
  transition = { type: "spring", stiffness: 200, damping: 25 },
  ...props
}: ToggleGroupHighlightProps) {
  const { value } = useToggleGroup();

  return (
    <Highlight
      data-slot="toggle-group-highlight"
      controlledItems
      value={typeof value === "string" ? value : null}
      exitDelay={0}
      transition={transition}
      {...props}
    />
  );
}

type ToggleGroupHighlightItemProps = HighlightItemProps &
  HTMLMotionProps<"div"> & {
    children: React.ReactElement;
  };

function ToggleGroupHighlightItem({ children, style, ...props }: ToggleGroupHighlightItemProps) {
  const { type, value } = useToggleGroup();

  if (type === "single") {
    return (
      <HighlightItem data-slot="toggle-group-highlight-item" style={{ inset: 0, ...style }} {...props}>
        {children}
      </HighlightItem>
    );
  }

  if (type === "multiple" && React.isValidElement(children)) {
    const isActive = props.value && value && (value as string[]).includes(props.value as string);

    const element = children as React.ReactElement<React.ComponentProps<"div">>;

    return React.cloneElement(
      children,
      {
        style: {
          ...element.props.style,
          position: "relative",
        },
        ...element.props,
      },
      <>
        <AnimatePresence>
          {isActive && (
            <motion.div
              data-slot="toggle-group-highlight-item"
              style={{ position: "absolute", inset: 0, zIndex: 0, ...style }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              {...props}
            />
          )}
        </AnimatePresence>

        <div
          style={{
            position: "relative",
            zIndex: 1,
          }}
        >
          {element.props.children}
        </div>
      </>,
    );
  }
}

export {
  ToggleGroup,
  ToggleGroupItem,
  ToggleGroupHighlight,
  ToggleGroupHighlightItem,
  useToggleGroup,
  type ToggleGroupProps,
  type ToggleGroupItemProps,
  type ToggleGroupHighlightProps,
  type ToggleGroupHighlightItemProps,
  type ToggleGroupContextType,
};
