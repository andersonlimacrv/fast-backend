# Dropdown Menu

URL: https://animate-ui.com/docs/components/radix/dropdown-menu

CLI: npx shadcn@latest add @animate-ui/components-radix-dropdown-menu

URL: /docs/components/radix/dropdown-menu

---

title: Dropdown Menu

description: Displays a menu to the user — such as a set of actions or functions — triggered by a button.

author:

name: imskyleen

url: https://github.com/imskyleen

---

DEMO:

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/animate-ui/components/radix/dropdown-menu';

interface RadixDropdownMenuDemoProps {
  side?: 'top' | 'bottom' | 'left' | 'right';
  sideOffset?: number;
  align?: 'start' | 'center' | 'end';
  alignOffset?: number;
}

export function RadixDropdownMenuDemo({
  side,
  sideOffset,
  align,
  alignOffset,
}: RadixDropdownMenuDemoProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">Open</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-56"
        align={align}
        alignOffset={alignOffset}
        side={side}
        sideOffset={sideOffset}
      >
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuGroup>
          <DropdownMenuItem>
            Profile
            <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>
            Billing
            <DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>
            Settings
            <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>
            Keyboard shortcuts
            <DropdownMenuShortcut>⌘K</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>Team</DropdownMenuItem>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Invite users</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem>Email</DropdownMenuItem>
              <DropdownMenuItem>Message</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>More...</DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuItem>
            New Team
            <DropdownMenuShortcut>⌘+T</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem>GitHub</DropdownMenuItem>
        <DropdownMenuItem>Support</DropdownMenuItem>
        <DropdownMenuItem disabled>API</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive">
          Log out
          <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

## Installation

Install the following dependencies (npm/pnpm/yarn/bun):

npm install lucide-react

Install the following registry dependencies:

npx shadcn@latest add @animate-ui/primitives-radix-dropdown-menu

Vendored code: `components/animate-ui/components/radix/dropdown-menu.tsx`
(components) + `components/animate-ui/primitives/radix/dropdown-menu.tsx`
(primitives), adapted: no 'use client' (Vite), CheckIcon/ChevronRightIcon/
CircleIcon → Check/ChevronRight/CircleDot via @/lib/icons.

Primitive chain: primitives-radix-dropdown-menu → primitives-effects-highlight
+ hooks-use-controlled-state + hooks-use-data-state + lib-get-strict-context.
`primitives-radix-checkbox` listed upstream but unreferenced → skipped.

## Usage (sidebar footer pattern)

<DropdownMenu>
  <DropdownMenuTrigger>Open</DropdownMenuTrigger>
  <DropdownMenuContent side="top" align="end">
    <DropdownMenuLabel>My Account</DropdownMenuLabel>
    <DropdownMenuSeparator />
    <DropdownMenuGroup>
      <DropdownMenuItem>
        <span>Profile</span>
        <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
      </DropdownMenuItem>
    </DropdownMenuGroup>
    <DropdownMenuSeparator />
    <DropdownMenuItem variant="destructive">
      <span>Log out</span>
      <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>

## API Reference

DropdownMenu / Trigger / Content / Group / Item (+variant destructive) /
CheckboxItem / RadioGroup / RadioItem / Label / Separator / Shortcut /
Sub / SubTrigger / SubContent / Portal / Highlight — see upstream:
https://animate-ui.com/docs/components/radix/dropdown-menu
(Radix UI API: DropdownMenu.Root et al.)

## Local notes (2026-09-16)

- Replaces our Base-UI `ui/dropdown-menu.tsx` (deleted — one menu system only).
- Radix opens on the pointer sequence (jsdom tests fire pointerDown+mouseDown+click).
- Footer menu uses `side="top"`; hover highlight via `Highlight`; mobile layering
  verified (portal paints above the Sheet).
