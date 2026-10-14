/* Composed ToggleGroup (change `custom-ui-toggle-group`): the upstream primitive
 * set with our layout — container, item base and the Highlight default.
 * Selection is painted ONLY by the sliding Highlight (`bg-accent`); items
 * carry no hover fill and no `data-[pressed]` fill of their own (faithful to
 * the doc demo, whose items are bare `size-8` buttons — hover paint would
 * mimic selection). No `onSelect`-style API: Radix drives single (string) /
 * multiple (array) values through `onValueChange`. */

import { cn } from "@/lib/utils";
import {
  ToggleGroup as ToggleGroupPrimitive,
  ToggleGroupHighlight as ToggleGroupHighlightPrimitive,
  ToggleGroupHighlightItem as ToggleGroupHighlightItemPrimitive,
  ToggleGroupItem as ToggleGroupItemPrimitive,
  useToggleGroup,
  type ToggleGroupHighlightItemProps as ToggleGroupHighlightItemPrimitiveProps,
  type ToggleGroupHighlightProps as ToggleGroupHighlightPrimitiveProps,
  type ToggleGroupItemProps as ToggleGroupItemPrimitiveProps,
  type ToggleGroupProps as ToggleGroupPrimitiveProps,
} from "./primitive";

type ToggleGroupProps = ToggleGroupPrimitiveProps;

function ToggleGroup({ className, ...props }: ToggleGroupProps) {
  return (
    <ToggleGroupPrimitive className={cn("inline-flex items-center gap-1", className)} {...props} />
  );
}

type ToggleGroupItemProps = ToggleGroupItemPrimitiveProps;

function ToggleGroupItem({ className, ...props }: ToggleGroupItemProps) {
  return (
    <ToggleGroupItemPrimitive
      className={cn(
        "relative inline-flex h-9 min-w-9 items-center justify-center gap-1.5 rounded-md px-3 text-sm font-medium whitespace-nowrap",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
        "disabled:pointer-events-none disabled:opacity-50",
        "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
        className,
      )}
      {...props}
    />
  );
}

type ToggleGroupHighlightProps = ToggleGroupHighlightPrimitiveProps;

function ToggleGroupHighlight({ className, ...props }: ToggleGroupHighlightProps) {
  return (
    <ToggleGroupHighlightPrimitive className={cn("bg-accent rounded-md", className)} {...props} />
  );
}

type ToggleGroupHighlightItemProps = ToggleGroupHighlightItemPrimitiveProps;

function ToggleGroupHighlightItem(props: ToggleGroupHighlightItemProps) {
  return <ToggleGroupHighlightItemPrimitive {...props} />;
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
};
