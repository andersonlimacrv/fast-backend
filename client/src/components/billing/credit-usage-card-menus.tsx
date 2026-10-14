/* Billing usage menus, extracted from the CreditUsageCard so the block stops
 * hand-rolling popovers (change `billing-card-menus`): the period picker and
 * the "more actions" menu now wrap the vendored Radix `DropdownMenu` — the
 * same package the sidebar uses — with `modal={false}` like the shell menus,
 * so they never trap focus over the page.
 *
 * Deltas vs the hand-rolled popovers they replace: the period options become
 * `DropdownMenuRadioItem` (correct single-choice semantics — `menuitemradio`
 * + `aria-checked` — instead of `listbox`/`option`) and both panels take the
 * app's menu spacing/typography. The actions list stays data-driven so the
 * card keeps owning labels, icons and handlers. */

import * as React from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/custom-ui/components/dropdown-menu/dropdown-menu";
import { ChevronDown, MoreVertical } from "@/lib/icons";
import { cn } from "@/lib/utils";

export interface UsagePeriodMenuProps {
  /** Options in render order (the card passes `PERIOD_OPTIONS`). */
  options: readonly string[];
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
}

function UsagePeriodMenu({ options, value, onValueChange, className }: UsagePeriodMenuProps) {
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Select usage period"
          className={cn(
            "group/period flex items-center gap-1 rounded-md border border-border px-2 py-1 text-[9px] whitespace-nowrap text-muted-foreground transition-all hover:bg-accent hover:text-accent-foreground focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none sm:gap-2",
            className,
          )}
        >
          {value}
          <ChevronDown
            aria-hidden="true"
            className="size-2.5 transition-transform duration-200 group-data-[state=open]/period:rotate-180 motion-reduce:transition-none"
          />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-36">
        <DropdownMenuRadioGroup value={value} onValueChange={onValueChange}>
          {options.map((option) => (
            <DropdownMenuRadioItem key={option} value={option}>
              {option}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export interface UsageAction {
  label: string;
  icon?: React.ReactNode;
  onSelect?: () => void;
  disabled?: boolean;
}

export interface UsageActionsMenuProps {
  actions: UsageAction[];
  /** Accessible name of the trigger (default "More actions"). */
  label?: string;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  className?: string;
}

function UsageActionsMenu({
  actions,
  label = "More actions",
  side = "top",
  align = "start",
  className,
}: UsageActionsMenuProps) {
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={label}
          className={cn(
            "flex items-center justify-center rounded-md focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none",
            className,
          )}
        >
          <MoreVertical className="size-4 cursor-pointer transition-colors hover:text-foreground" aria-hidden="true" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side={side} align={align} className="w-44">
        {actions.map((action) => (
          <DropdownMenuItem key={action.label} onSelect={action.onSelect} disabled={action.disabled}>
            {action.icon}
            {action.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export { UsagePeriodMenu, UsageActionsMenu };
