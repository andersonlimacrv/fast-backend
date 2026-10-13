/* Live proofs for catalog items, keyed by slug (`lib/catalog`).
 *
 * One registry, two consumers: `/admin/lab/trials` renders the proofs of
 * `pending` items, `/admin/gallery` renders the same nodes for `validated`
 * ones — validating an item is literally flipping `status` in the catalog.
 * Items without a proof yet are listed by the pages themselves (no entry here).
 *
 * Conventions (review-design): neutral data, no console.log, tokens only,
 * reduced-motion honored, keyboard reachable. */

import * as React from "react";

import { AvatarGroup } from "@/components/custom-ui/components/avatar-group/avatar-group";
import { OrgSwitcher, OrganizationsRailMenuItem, ProjectsRailMenuItem } from "@/components/app-sidebar";
import { Highlight } from "@/components/custom-ui/effects/highlight";
import { CreditUsageCard } from "@/components/billing/credit-usage-card";
import { UsageActionsMenu, UsagePeriodMenu } from "@/components/billing/credit-usage-card-menus";
import { ErrorOne, defaultErrorOneAction } from "@/components/error-state";
import { ExpandDetails } from "@/components/custom-ui/components/expand-details";
import { SegmentedProgressBar } from "@/components/custom-ui/components/segmented-progress-bar";
import {
  SubscriptionCalendar,
  type SubscriptionDay,
} from "@/components/custom-ui/components/subscription-calendar";
import { Switch } from "@/components/custom-ui/components/switch";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/custom-ui/components/dropdown-menu/dropdown-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/custom-ui/components/accordion";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  type CollapsibleReveal,
} from "@/components/custom-ui/components/collapsible";
import {
  Checkbox,
} from "@/components/custom-ui/components/checkbox";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/custom-ui/components/alert-dialog";
import { CircularProgress } from "@/components/custom-ui/components/circular-progress";
import { CopyButton } from "@/components/custom-ui/components/copy-button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/custom-ui/components/dialog";
import {
  FileItem,
  Files,
  FolderItem,
  FolderPanel,
  FolderTrigger,
  SubFiles,
} from "@/components/custom-ui/components/files/files";
import { FileUploader } from "@/components/custom-ui/components/file-uploader";
import { GooeyMenu, type GooeyMenuData } from "@/components/custom-ui/components/gooey-menu";
import { FloatingInput } from "@/components/custom-ui/components/floating-input";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioItem } from "@/components/ui/radio";
import { RunActionButton } from "@/components/custom-ui/components/run-action-button";
import {
  Tabs,
  TabsHighlight,
  TabsHighlightItem,
  TabsList,
  TabsPanel,
  TabsPanels,
  TabsTab,
} from "@/components/custom-ui/components/tabs/tabs";
import {
  ToggleGroup,
  ToggleGroupHighlight,
  ToggleGroupHighlightItem,
  ToggleGroupItem,
} from "@/components/custom-ui/components/toggle-group/toggle-group";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/custom-ui/components/tooltip/tooltip";
import { ROUTES } from "@/lib/constants";
import { Bold, Check, ChevronDown, FileCode, Italic, Underline, X } from "@/lib/icons";

/* ---------- stateful wrappers (hooks need a component boundary) ---------- */

/* Composed proof for item 12 (Files): same content as the old data-driven
 * demo (src/app/docs with git statuses), written in the upstream form —
 * folders expand/collapse, the hover highlight slides, the folder icon swaps
 * and git states render as U/M/D. No selection: the upstream has none. */
function FileTreeDemo() {
  return (
    <div className="grid gap-3">
      <Files defaultOpen={["src"]}>
        <FolderItem value="src">
          <FolderTrigger>src</FolderTrigger>
          <FolderPanel>
            <SubFiles>
              <FolderItem value="components">
                <FolderTrigger>components</FolderTrigger>
                <FolderPanel>
                  <SubFiles>
                    <FileItem icon={FileCode} gitStatus="modified">
                      app-sidebar.tsx
                    </FileItem>
                    <FileItem icon={FileCode}>icons.tsx</FileItem>
                  </SubFiles>
                </FolderPanel>
              </FolderItem>
              <FileItem icon={FileCode}>main.tsx</FileItem>
              <FileItem gitStatus="untracked">notes.txt</FileItem>
            </SubFiles>
          </FolderPanel>
        </FolderItem>
      </Files>
      <p className="text-xs text-muted-foreground">
        Composed upstream form (`Files/FolderItem/FolderTrigger/FolderPanel/FileItem`): folders toggle on
        click or keyboard, files are display-only — the old `onSelect` note is gone with the rewrite.
      </p>
    </div>
  );
}

function AccordionHover() {
  return (
    <div>
      <p className="mb-2 text-xs font-medium text-muted-foreground">Single — onHover (abre/fecha sem clique)</p>
      <Accordion onHover>
        {FAQ.map((i) => (
          <AccordionItem key={i.value} value={i.value}>
            <AccordionTrigger>{i.title}</AccordionTrigger>
            <AccordionContent>{i.body}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}

function AccordionDepthForComparison() {
  return (
    <div>
      <p className="mb-2 text-xs font-medium text-muted-foreground">Single — reveal="depth" (alternativa)</p>
      <Accordion>
        {FAQ.map((i) => (
          <AccordionItem key={i.value} value={i.value}>
            <AccordionTrigger>{i.title}</AccordionTrigger>
            <AccordionContent reveal="depth">{i.body}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}

/** House panel spring (the Accordion's), used by the `mask` reveal proof. */
const DISCLOSURE_SPRING = { type: "spring", stiffness: 150, damping: 22 } as const;

function CollapsibleVariant({ reveal, label, body }: { reveal: CollapsibleReveal; label: string; body: string }) {
  return (
    <Collapsible className="rounded-lg border border-border px-3">
      <CollapsibleTrigger className="flex w-full items-center justify-between gap-2 py-3 text-left text-sm font-medium outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring [&[data-state=open]>svg]:rotate-180">
        {label}
        <ChevronDown
          className="size-4 shrink-0 text-muted-foreground transition-transform duration-150"
          aria-hidden="true"
        />
      </CollapsibleTrigger>
      <CollapsibleContent
        reveal={reveal}
        transition={reveal === "mask" ? DISCLOSURE_SPRING : undefined}
        className="text-sm"
      >
        <div className="pb-3 text-muted-foreground">{body}</div>
      </CollapsibleContent>
    </Collapsible>
  );
}

/* Proof for item 24: the three reveals of the disclosure the Accordion and
 * the sidebar groups are built on (change `gallery-proof-gaps`). */
function CollapsibleDemo() {
  return (
    <div className="grid gap-4">
      <div className="grid gap-4 md:grid-cols-3">
        <CollapsibleVariant
          reveal="slide"
          label="slide — sidebar default"
          body="Panel rises 20px while opening (the vendored registry transition)."
        />
        <CollapsibleVariant
          reveal="depth"
          label="depth — alternative"
          body="Top-hinged rotateX + slight scale: reads as coming from a plane behind."
        />
        <CollapsibleVariant
          reveal="mask"
          label="mask — Accordion base"
          body="Curtain reveal by CSS mask with the house spring (150/22): the Accordion panel."
        />
      </div>
      <p className="text-xs text-muted-foreground">
        Open and close both animate (AnimatePresence over the vendored radix disclosure): the Accordion (02) is
        built on this component — sidebar groups use slide, the Accordion uses mask.
      </p>
    </div>
  );
}

/* Proof for item 22 (change `gallery-proof-gaps`): the real tooltip (pill +
 * arrow), not the source doc's GooeyMenu — the three sides the product
 * uses/picks from, with the shell's openDelay. */
function TooltipDemo() {
  return (
    <div className="grid gap-4">
      <TooltipProvider openDelay={0}>
        <div className="flex flex-wrap items-center gap-3">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="sm">
                Hover — top (default)
              </Button>
            </TooltipTrigger>
            <TooltipContent>Pill + arrow — kit default</TooltipContent>
          </Tooltip>
          <Tooltip side="right" align="center">
            <TooltipTrigger asChild>
              <Button variant="outline" size="sm">
                Rail style — side right
              </Button>
            </TooltipTrigger>
            <TooltipContent>Side right — app shell rail</TooltipContent>
          </Tooltip>
          <Tooltip side="bottom">
            <TooltipTrigger asChild>
              <Button variant="outline" size="sm">
                Side bottom
              </Button>
            </TooltipTrigger>
            <TooltipContent>Bottom side</TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
      <p className="text-xs text-muted-foreground">
        Pill + arrow over the primary token (both themes); `openDelay={0}` like the sidebar. Hover or focus any
        trigger — the right side matches the shell rail usage.
      </p>
    </div>
  );
}

function CircularProgressDemo() {
  const [value, setValue] = React.useState(0);
  const [auto, setAuto] = React.useState(true);
  const [mountKey, setMountKey] = React.useState(0);

  // Same loop as the upstream demo: 0 -> 100 in steps of 10, every 2s.
  React.useEffect(() => {
    if (!auto) return;
    const id = window.setInterval(() => setValue((prev) => (prev >= 100 ? 0 : prev + 10)), 2000);
    return () => window.clearInterval(id);
  }, [auto]);

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center gap-6">
        <CircularProgress key={`fills-${mountKey}`} value={value} size={160} />
        <CircularProgress key={`jump-${mountKey}`} value={value} size={160} animateOnMount={false} />
        <CircularProgress key={`thin-${mountKey}`} value={value} size={120} strokeWidth={6} showValue={false} />
      </div>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={() => setMountKey((k) => k + 1)}>
          Replay mount
        </Button>
        <Button variant="outline" size="sm" onClick={() => setValue((v) => Math.max(0, v - 10))}>
          −10
        </Button>
        <Button variant="outline" size="sm" onClick={() => setValue((v) => Math.min(100, v + 10))}>
          +10
        </Button>
        <Button variant="outline" size="sm" onClick={() => setAuto((a) => !a)}>
          {auto ? "Pause loop" : "Resume loop"}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        value {value}% · left fills from 0 on every mount (upstream effect) · middle has the initial animation
        disabled — it jumps straight to the value · right is the thin variant without the label. &quot;Replay
        mount&quot; remounts all three to watch the fill again.
      </p>
    </div>
  );
}

function SwitchDemo() {
  const [on, setOn] = React.useState(true);
  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center gap-6">
        <label className="flex items-center gap-2 text-sm">
          <Switch defaultChecked aria-label="Default switch" />
          default
        </label>
        <label className="flex items-center gap-2 text-sm">
          <Switch aria-label="Off switch" />
          off
        </label>
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <Switch disabled aria-label="Disabled switch" />
          disabled
        </label>
        <label className="flex items-center gap-2 text-sm">
          <Switch aria-label="Small switch" width={40} height={20} />
          small
        </label>
        <label className="flex items-center gap-2 text-sm">
          <Switch aria-label="Large switch" width={72} height={36} />
          large
        </label>
      </div>
      <label className="flex items-center gap-3 text-sm">
        <Switch
          checked={on}
          onCheckedChange={setOn}
          aria-label="Notifications"
          startContent={<Check className="size-3.5" />}
          endContent={<X className="size-3.5" />}
        />
        controlled — notifications are <span className="font-medium">{on ? "on" : "off"}</span>
      </label>
      <p className="text-xs text-muted-foreground">
        Base extracted from SwitchModeToggle: pill track, knob sliding with a spring, and content pinned to each
        half where the knob side reads as active. Colours follow the validated Checkbox language (active = green
        fill) plus the contrast rim from `design-contrast-borders`.
      </p>
    </div>
  );
}

const FAQ = [
  { value: "shipping", title: "How long does shipping take?", body: "Standard orders arrive in 3–5 business days; express in 1–2." },
  { value: "returns", title: "What is the return window?", body: "Unused items can be returned within 30 days of delivery." },
  { value: "support", title: "How do I reach support?", body: "Write to the support channel on business days, 9–18." },
];

function AccordionSingle() {
  return (
    <Accordion>
      {FAQ.map((i) => (
        <AccordionItem key={i.value} value={i.value}>
          <AccordionTrigger>{i.title}</AccordionTrigger>
          <AccordionContent>{i.body}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

function AccordionMultiple() {
  return (
    <div>
      <p className="mb-2 text-xs font-medium text-muted-foreground">Multiple open</p>
      <Accordion multiple defaultValue={["shipping"]}>
        {FAQ.map((i) => (
          <AccordionItem key={i.value} value={i.value}>
            <AccordionTrigger>{i.title}</AccordionTrigger>
            <AccordionContent>{i.body}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}

function AccordionKeepRendered() {
  return (
    <div>
      <p className="mb-2 text-xs font-medium text-muted-foreground">keepRendered (panel stays mounted)</p>
      <Accordion multiple defaultValue={["shipping"]}>
        {FAQ.map((i) => (
          <AccordionItem key={i.value} value={i.value}>
            <AccordionTrigger>{i.title}</AccordionTrigger>
            <AccordionContent keepRendered>{i.body}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}

function DialogDemo() {
  return (
    <div className="grid gap-4">
      <Dialog>
        <form className="contents" onSubmit={(event) => event.preventDefault()}>
          <DialogTrigger className={buttonVariants({ variant: "outline" })}>Open dialog</DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit profile</DialogTitle>
              <DialogDescription>
                Make changes to your profile here. Click save when you&apos;re done.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4">
              <div className="grid gap-3">
                <label htmlFor="demo-dialog-name" className="text-sm font-medium">
                  Name
                </label>
                <Input id="demo-dialog-name" name="name" defaultValue="Pedro Duarte" />
              </div>
              <div className="grid gap-3">
                <label htmlFor="demo-dialog-username" className="text-sm font-medium">
                  Username
                </label>
                <Input id="demo-dialog-username" name="username" defaultValue="@peduarte" />
              </div>
            </div>
            <DialogFooter>
              <DialogClose className={buttonVariants({ variant: "outline" })}>Cancel</DialogClose>
              <Button type="submit">Save changes</Button>
            </DialogFooter>
          </DialogContent>
        </form>
      </Dialog>
      <div className="flex flex-wrap gap-3">
        <Dialog>
          <DialogTrigger className={buttonVariants({ variant: "outline", size: "sm" })}>
            variant: from=&quot;top&quot;
          </DialogTrigger>
          <DialogContent from="top">
            <DialogHeader>
              <DialogTitle>Flip from the top</DialogTitle>
              <DialogDescription>
                Same port, entering with a negative rotateX — compare with the default (bottom).
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
        <Dialog>
          <DialogTrigger className={buttonVariants({ variant: "outline", size: "sm" })}>
            variant: showCloseButton=false
          </DialogTrigger>
          <DialogContent showCloseButton={false}>
            <DialogHeader>
              <DialogTitle>No close button</DialogTitle>
              <DialogDescription>Only DialogClose, Esc or the backdrop dismiss this one.</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose className={buttonVariants({ variant: "outline" })}>Close</DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <p className="text-xs text-muted-foreground">
        Composed port (upstream `DialogPopup` is our `DialogContent`): the first dialog is the default — the panel
        flips in from `bottom`, the app-wide overlay convention; the buttons above are prop variants (`from` takes
        `top|bottom|left|right`). The layout copies the 03 AlertDialog for visual consistency.
      </p>
    </div>
  );
}

/** Validation harness for the CreditUsageCard (item 07) and its modules: the
 * slider drives `usedCreditsPercent` (label and bar read the same controlled
 * value), the switch replays the mount fill, and the section below renders
 * every module of the block on its own so the map stays visible. Lab-only. */
function CreditUsageCardDemo() {
  const [usage, setUsage] = React.useState(56.4);
  const [animateOnMount, setAnimateOnMount] = React.useState(true);
  const [period, setPeriod] = React.useState("30 Days");
  const [sampleSwitch, setSampleSwitch] = React.useState(true);
  return (
    <div className="grid gap-6">
      <div className="grid max-w-135 gap-3">
        <label htmlFor="credit-usage-validation" className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="w-24 shrink-0 font-medium">usage %</span>
          <input
            id="credit-usage-validation"
            type="range"
            min={0}
            max={100}
            step={0.1}
            value={usage}
            onChange={(event) => setUsage(Number(event.target.value))}
            className="lab-range w-full focus-visible:ring-2 focus-visible:ring-ring"
          />
          <span className="w-14 shrink-0 text-right font-mono tabular-nums">{usage.toFixed(1)}%</span>
        </label>
        <label className="flex items-center gap-2 text-xs text-muted-foreground">
          <Switch
            width={40}
            height={20}
            checked={animateOnMount}
            onCheckedChange={setAnimateOnMount}
            aria-label="animateOnMount"
          />
          animateOnMount — fills the label and the bar from zero on mount
        </label>
        {/* Remount on toggle so the fill replays for the owner. */}
        <CreditUsageCard
          key={animateOnMount ? "animate" : "static"}
          usedCreditsPercent={usage}
          animateOnMount={animateOnMount}
        />
      </div>

      <div className="grid gap-3">
        <h4 className="text-sm font-medium">Modules of this block</h4>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2 rounded-lg border border-border p-3">
            <SegmentedProgressBar value={40} label="Standalone sample" className="bg-muted/50" />
            <code className="text-[10px] text-muted-foreground">
              SegmentedProgressBar · custom-ui/components/segmented-progress-bar.tsx
            </code>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border p-3">
            <UsagePeriodMenu
              options={["7 Days", "14 Days", "30 Days"]}
              value={period}
              onValueChange={setPeriod}
            />
            <code className="text-[10px] text-muted-foreground">
              UsagePeriodMenu · billing/credit-usage-card-menus.tsx
            </code>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border p-3">
            <UsageActionsMenu
              actions={[
                { label: "Export CSV", onSelect: () => undefined },
                { label: "Refresh data", onSelect: () => undefined },
              ]}
            />
            <code className="text-[10px] text-muted-foreground">
              UsageActionsMenu · billing/credit-usage-card-menus.tsx
            </code>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border p-3">
            <Switch
              width={40}
              height={20}
              checked={sampleSwitch}
              onCheckedChange={setSampleSwitch}
              aria-label="Standalone switch sample"
            />
            <code className="text-[10px] text-muted-foreground">
              Switch (item 25) · custom-ui/components/switch.tsx
            </code>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Proof for item 10 (DropdownMenu): the doc's demo surface — label, groups
 * with shortcuts, sub-menu, checkbox and radio items, disabled and destructive
 * items — plus the sidebar-footer placement (`side="top" align="end"`) the
 * shell uses. The component is the vendored package in
 * `custom-ui/components/dropdown-menu` (radix + `Highlight`). Non-modal like
 * the shell menus, so nothing traps focus over the page. */
function DropdownMenuDemo() {
  const [compact, setCompact] = React.useState(false);
  const [density, setDensity] = React.useState("comfortable");
  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">Open</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
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
                  <DropdownMenuItem>More…</DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuItem>
                New Team
                <DropdownMenuShortcut>⌘+T</DropdownMenuShortcut>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem checked={compact} onCheckedChange={setCompact}>
              Compact rows
            </DropdownMenuCheckboxItem>
            <DropdownMenuRadioGroup value={density} onValueChange={setDensity}>
              <DropdownMenuRadioItem value="comfortable">Comfortable</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="dense">Dense</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
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

        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">Footer placement (side=&quot;top&quot;)</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              Profile
              <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive">
              Log out
              <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <p className="text-xs text-muted-foreground">
        Vendored radix package (review-design §11): the highlight slides between items, sub-menus open
        to the side, and the shell uses the same placements shown above (`side=&quot;right&quot;` in the
        rail, <code className="font-mono text-[10px]">side=&quot;top&quot; align=&quot;end&quot;</code> in
        the footer).
      </p>
    </div>
  );
}

/** Proof for item 11 (ExpandDetails): the default block (open) plus a
 * data-driven twin (`Run`, three items, collapsed). The card measures its own
 * content and animates width/height/radius; click the header to toggle. */
function ExpandDetailsDemo() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 sm:items-start">
      <div className="flex min-h-40 items-center justify-center rounded-lg border border-border p-6">
        <ExpandDetails />
      </div>
      <div className="flex min-h-40 items-center justify-center rounded-lg border border-border p-6">
        <ExpandDetails
          title="Run"
          defaultOpen={false}
          items={[
            { label: "Status", value: "Succeeded", wide: true },
            { label: "Duration", value: "12.4s" },
            { label: "Retries", value: "0" },
          ]}
        />
      </div>
    </div>
  );
}

/* Item 18 proof data: the doc's demo month (Feb 2026) with the brand logos
 * replaced by coloured initials — no new icon library. */
const SUBSCRIPTION_MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const SUBSCRIPTION_DAYS: SubscriptionDay[] = [
  { date: 29, isMuted: true },
  { date: 30, isMuted: true },
  { date: 31, isMuted: true },
  { date: 1 },
  {
    date: 2,
    indicators: [<span key="dot" className="size-1.5 rounded-full bg-yellow-400" />],
    isLogo: [<span key="logo" className="text-[10px] font-extrabold text-red-600">N</span>],
  },
  { date: 3 },
  {
    date: 4,
    indicators: [<span key="dot" className="size-1.5 rounded-full bg-purple-400" />],
    isLogo: [<span key="logo" className="text-[10px] font-extrabold text-[#F00A07]">A</span>],
  },
  { date: 5 },
  { date: 6 },
  { date: 7 },
  { date: 8 },
  { date: 9 },
  {
    date: 10,
    indicators: [<span key="dot" className="size-1.5 rounded-full bg-purple-400" />],
    isLogo: [<span key="logo" className="text-[10px] font-extrabold text-[#827BFF]">C</span>],
  },
  { date: 11 },
  { date: 12 },
  { date: 13 },
  { date: 14 },
  { date: 15 },
  { date: 16 },
  { date: 17 },
  { date: 18 },
  { date: 19 },
  { date: 20 },
  { date: 21 },
  { date: 22 },
  { date: 23 },
  { date: 24 },
  {
    date: 25,
    indicators: [<span key="dot" className="size-1.5 rounded-full bg-yellow-400" />],
    isLogo: [<span key="logo" className="text-foreground text-[10px] font-extrabold">A</span>],
  },
  { date: 26 },
  { date: 27 },
  { date: 28 },
  { date: 29 },
  { date: 30 },
  { date: 31 },
  { date: 1, isMuted: true },
];

/** Proof for item 18 (SubscriptionCalendar): the doc's demo month, navigable —
 * arrows change the month, "+" opens quick add, the lupa opens search and the
 * cube opens the monthly summary; clicking a day moves the glow. */
function SubscriptionCalendarDemo() {
  const [monthIndex, setMonthIndex] = React.useState(1);
  return (
    <div className="grid gap-3">
      <SubscriptionCalendar
        month={SUBSCRIPTION_MONTHS[monthIndex]}
        year={2026}
        onPrevMonth={() => setMonthIndex((prev) => (prev === 0 ? 11 : prev - 1))}
        onNextMonth={() => setMonthIndex((prev) => (prev === 11 ? 0 : prev + 1))}
        days={SUBSCRIPTION_DAYS}
        monthlyTotal={156.23}
        subscriptionsCount={9}
        newCount={3}
      />
      <p className="text-xs text-muted-foreground">
        Ported block (tokens): month navigation, quick add, search and the monthly summary overlays; the selected
        day carries the animated glow (`layoutId` scoped per instance).
      </p>
    </div>
  );
}

/** Proof for item 21 (ToggleGroup): the doc's single + multiple forms — one
 * value at a time with the pill sliding, several at once with per-item
 * overlays. Non-modal like the shell menus; the highlight carries selection. */
function ToggleGroupDemo() {
  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center gap-6">
        <ToggleGroup type="single" defaultValue="bold" aria-label="text style">
          <ToggleGroupHighlight>
            <ToggleGroupHighlightItem value="bold">
              <ToggleGroupItem value="bold" aria-label="bold">
                <Bold aria-hidden="true" />
              </ToggleGroupItem>
            </ToggleGroupHighlightItem>
            <ToggleGroupHighlightItem value="italic">
              <ToggleGroupItem value="italic" aria-label="italic">
                <Italic aria-hidden="true" />
              </ToggleGroupItem>
            </ToggleGroupHighlightItem>
            <ToggleGroupHighlightItem value="underline">
              <ToggleGroupItem value="underline" aria-label="underline">
                <Underline aria-hidden="true" />
              </ToggleGroupItem>
            </ToggleGroupHighlightItem>
          </ToggleGroupHighlight>
        </ToggleGroup>
        <ToggleGroup type="multiple" defaultValue={["bold"]} aria-label="text decorations">
          <ToggleGroupHighlightItem value="bold" className="bg-accent rounded-md">
            <ToggleGroupItem value="bold" aria-label="multiple bold">
              <Bold aria-hidden="true" />
            </ToggleGroupItem>
          </ToggleGroupHighlightItem>
          <ToggleGroupHighlightItem value="italic" className="bg-accent rounded-md">
            <ToggleGroupItem value="italic" aria-label="multiple italic">
              <Italic aria-hidden="true" />
            </ToggleGroupItem>
          </ToggleGroupHighlightItem>
        </ToggleGroup>
      </div>
      <p className="text-xs text-muted-foreground">
        Single slides one pill between items; multiple fades one overlay per active item — both over the
        vendored Radix primitive (`custom-ui/components/toggle-group`), non-modal like the shell menus.
      </p>
    </div>
  );
}

/** Proof for item 20 (Tabs): the doc demo — account/password forms with the
 * sliding Highlight pill, panels fading with blur, auto-height wrapper; plus
 * a labelled `mode="layout"` twin. */
function TabsDemo() {
  return (
    <div className="grid gap-4">
      <Tabs defaultValue="account" className="max-w-100">
        <TabsHighlight>
          <TabsList>
            <TabsHighlightItem value="account">
              <TabsTab value="account">Account</TabsTab>
            </TabsHighlightItem>
            <TabsHighlightItem value="password">
              <TabsTab value="password">Password</TabsTab>
            </TabsHighlightItem>
          </TabsList>
        </TabsHighlight>
        <TabsPanels>
          <TabsPanel value="account" className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Make changes to your account here. Click save when you&apos;re done.
            </p>
            <div className="space-y-3">
              <div className="flex flex-col space-y-1">
                <label htmlFor="tabs-demo-name" className="text-sm">
                  Name
                </label>
                <Input id="tabs-demo-name" defaultValue="Pedro Duarte" />
              </div>
              <div className="flex flex-col space-y-1">
                <label htmlFor="tabs-demo-username" className="text-sm">
                  Username
                </label>
                <Input id="tabs-demo-username" defaultValue="@peduarte" />
              </div>
            </div>
            <button type="button" className={buttonVariants({ variant: "default" })}>
              Save changes
            </button>
          </TabsPanel>
          <TabsPanel value="password" className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Change your password here. After saving, you&apos;ll be logged out.
            </p>
            <div className="flex flex-col space-y-1">
              <label htmlFor="tabs-demo-current" className="text-sm">
                Current password
              </label>
              <Input id="tabs-demo-current" type="password" />
            </div>
            <button type="button" className={buttonVariants({ variant: "default" })}>
              Save password
            </button>
          </TabsPanel>
        </TabsPanels>
      </Tabs>
      <Tabs defaultValue="account" className="max-w-100" aria-label='mode="layout" twin'>
        <TabsHighlight>
          <TabsList>
            <TabsHighlightItem value="account">
              <TabsTab value="account">Account</TabsTab>
            </TabsHighlightItem>
            <TabsHighlightItem value="password">
              <TabsTab value="password">Password</TabsTab>
            </TabsHighlightItem>
          </TabsList>
        </TabsHighlight>
        <TabsPanels mode="layout">
          <TabsPanel value="account">
            <p className="text-sm text-muted-foreground">Variant: mode=&quot;layout&quot;.</p>
          </TabsPanel>
          <TabsPanel value="password">
            <p className="text-sm text-muted-foreground">Variant: mode=&quot;layout&quot;.</p>
          </TabsPanel>
        </TabsPanels>
      </Tabs>
      <p className="text-xs text-muted-foreground">
        Pill slides via the Highlight (spring 200/25); panels fade with blur; the wrapper animates height in
        auto-height mode.
      </p>
    </div>
  );
}

/** Proof for item 23 (UserAvatar): every variation — sizes, overflow, overlap
 * direction. Hover shifts the avatar forward with the name tooltip (the same
 * pill the sidebar uses). */
const AVATAR_USERS = [
  { name: "Ada Lovelace", presence: "online" },
  { name: "Alan Turing", presence: "online" },
  { name: "Grace Hopper", presence: "offline" },
  { name: "Edsger Dijkstra", presence: "offline" },
  { name: "Barbara Liskov", presence: "online" },
] as const;

function AvatarVariant({ label, ...props }: { label: string } & React.ComponentProps<typeof AvatarGroup>) {
  return (
    <div className="flex flex-col gap-2">
      <AvatarGroup {...props} />
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

/* Health inspector rows (item 26 proof): the production data of /health. */
const GOOEY_INSPECTOR: GooeyMenuData[] = [
  {
    key: "client",
    label: "Client",
    value: "design-unification",
    labelClass: "text-sm font-medium text-muted-foreground",
    valueClass: "text-sm text-muted-foreground",
  },
  {
    key: "api",
    label: "API",
    value: "/api",
    labelClass: "text-sm font-medium",
    valueClass: "font-mono text-sm text-muted-foreground",
  },
  {
    key: "ready",
    label: "Ready",
    value: "ready",
    labelClass: "text-sm font-medium",
    valueClass: "font-mono text-sm text-muted-foreground",
  },
  {
    key: "errors",
    label: "Errors",
    value: "0",
    labelClass: "text-sm font-medium",
    valueClass:
      "flex items-center justify-center rounded-md border border-destructive/20 bg-destructive/10 px-2 py-0.5 font-mono text-sm text-destructive",
  },
];

export const DEMOS: Record<string, React.ReactNode> = {
  "404-page-not-found": (
    <div className="rounded-md border border-border">
      <ErrorOne
        code="404"
        title="Page not found"
        description="The address doesn't match any route in this console."
        action={defaultErrorOneAction(ROUTES.home)}
        className="min-h-0 py-8"
      />
    </div>
  ),

  accordion: (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      <div>
        <p className="mb-2 text-xs font-medium text-muted-foreground">Single — mask (upstream, default)</p>
        <AccordionSingle />
      </div>
      <AccordionHover />
      <AccordionMultiple />
      <AccordionKeepRendered />
      <AccordionDepthForComparison />
    </div>
  ),

  "alert-dialog": (
    <div className="flex flex-wrap items-center gap-3">
      <AlertDialog>
        <AlertDialogTrigger className={buttonVariants({ variant: "destructive" })}>Delete organization</AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogTitle>Delete this organization?</AlertDialogTitle>
          <AlertDialogDescription>
            Memberships and projects become unreachable. This cannot be undone.
          </AlertDialogDescription>
          <div className="mt-5 flex justify-end gap-2">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive">Delete</AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog>
        <AlertDialogTrigger className={buttonVariants({ variant: "outline" })}>
          variant: from=&quot;top&quot;
        </AlertDialogTrigger>
        <AlertDialogContent from="top">
          <AlertDialogTitle>Flip from the top</AlertDialogTitle>
          <AlertDialogDescription>
            Same primitive, entering with a negative rotateX — compare with the default (bottom).
          </AlertDialogDescription>
          <div className="mt-5 flex justify-end gap-2">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction>Confirm</AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  ),

  "animated-circular-progress-bar": <CircularProgressDemo />,

  switch: <SwitchDemo />,

  checkbox: (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center gap-5">
        <label className="flex items-center gap-2 text-sm">
          <Checkbox defaultChecked aria-label="default checked" /> default
        </label>
        <label className="flex items-center gap-2 text-sm">
          <Checkbox variant="accent" aria-label="accent" /> accent
        </label>
        <label className="flex items-center gap-2 text-sm">
          <Checkbox size="sm" aria-label="small" /> sm
        </label>
        <label className="flex items-center gap-2 text-sm">
          <Checkbox size="lg" aria-label="large" /> lg
        </label>
        <label className="flex items-center gap-2 text-sm">
          <Checkbox indeterminate aria-label="indeterminate" /> indeterminate
        </label>
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <Checkbox disabled aria-label="disabled" /> disabled
        </label>
      </div>
      <p className="text-xs text-muted-foreground">
        Site aesthetics: a size-5 box (sm/lg rounder), checked/indeterminate filled with the primary token and a
        500ms colour transition; the check draws itself in (0.2s, +0.2s delay) and the box only reacts on press
        (no hover growth). The indicator comes from the component — no extra child needed.
      </p>
    </div>
  ),

  collapsible: <CollapsibleDemo />,

  "copy-button": (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <code className="rounded-md bg-muted px-2 py-1 font-mono text-xs">org-123</code>
        <CopyButton content="org-123" />
        <CopyButton content="org-123" variant="accent" />
        <CopyButton content="org-123" variant="secondary" />
        <CopyButton content="org-123" variant="outline" />
        <CopyButton content="org-123" variant="ghost" />
        <CopyButton content="org-123" variant="destructive" />
        <CopyButton content="org-123" variant="link" />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <CopyButton content="org-123" size="xs" />
        <CopyButton content="org-123" size="sm" />
        <CopyButton content="org-123" size="default" />
        <CopyButton content="org-123" size="lg" />
      </div>
      <p className="text-xs text-muted-foreground">
        Click any of them: the glyph cross-fades with a scale + blur swap (0.25s, AnimatePresence popLayout) and
        returns to the copy icon after 3s. Variants and square sizes come from the site&apos;s cva; the button only
        reacts on press (no hover growth, same call as the Checkbox).
      </p>
    </div>
  ),

  "credit-usage-card": <CreditUsageCardDemo />,

  dialog: <DialogDemo />,

  "dropdown-menu": <DropdownMenuDemo />,

  "expand-details": <ExpandDetailsDemo />,

  "file-tree": <FileTreeDemo />,

  "file-upload": <FileUploader />,

  "gooey-menu": (
    <div className="grid gap-4">
      <GooeyMenu data={GOOEY_INSPECTOR} />
      <p className="text-xs text-muted-foreground">
        Color settled (change `gooey-menu-gallery`): `primary` silhouette at 60% opacity — identical in light
        and dark (0.8487), reading subtle in light and bold in dark; the opacity sits after the filter (inside
        it the goo matrix saturates alpha). Hover or focus to expand. Validated by the owner on 2026-10-09.
      </p>
    </div>
  ),

  inputs: (
    <div className="grid gap-6">
      <div className="grid max-w-sm gap-4">
        <FloatingInput label="Email Address" type="email" />
        <FloatingInput label="Password" type="password" />
        <p className="text-xs text-muted-foreground">default · email + password (doc demo)</p>
      </div>
      <div className="grid max-w-sm gap-4">
        <FloatingInput label="Project name" defaultValue="Apollo" />
        <FloatingInput label="Disabled" disabled />
        <Input placeholder="Plain input (ui/input)" />
        <p className="text-xs text-muted-foreground">prefilled (opens floated) · disabled · plain</p>
      </div>
    </div>
  ),

  radio: (
    <RadioGroup defaultValue="member" aria-label="demo role">
      <label className="flex items-center gap-2 text-sm">
        <RadioItem value="owner" /> owner
      </label>
      <label className="flex items-center gap-2 text-sm">
        <RadioItem value="admin" /> admin
      </label>
      <label className="flex items-center gap-2 text-sm">
        <RadioItem value="member" /> member
      </label>
    </RadioGroup>
  ),

  "run-action-button": <RunActionButton />,

  sidebar: (
    <div className="grid gap-6">
      <div className="grid max-w-64 gap-2">
        <Highlight>
          <OrgSwitcher
            orgs={[
              {
                id: "o-long",
                name: "Acme Incorporated International Holdings Ltd Division",
                slug: "acme-incorporated-international-holdings-ltd",
              },
              { id: "o-short", name: "Evil Corp", slug: "evil-corp" },
            ]}
            activeOrgId="o-long"
            onSwitchOrg={() => {}}
          />
        </Highlight>
        <p className="text-xs text-muted-foreground">
          S7.2 proof (RULES §12): long names truncate with full titles; open the menu for the full rows.
        </p>
      </div>
      <div className="grid gap-2">
        <Highlight>
          <div className="flex gap-2">
            <OrganizationsRailMenuItem activeOrgId="o1" orgsActive={false} />
            <ProjectsRailMenuItem
              projects={[
                { id: "p1", org_id: "o1", name: "Apollo Program Landing Initiative" },
                { id: "p2", org_id: "o1", name: "Zephyr" },
              ]}
              loading={false}
              projectsActive={false}
            />
          </div>
        </Highlight>
        <p className="text-xs text-muted-foreground">
          S7.3 proof (RULES §12): rail icons with tooltips; menus anchor right with truncated rows.
        </p>
      </div>
    </div>
  ),

  "switch-mode-toggle": <ThemeToggle />,

  "subsription-calendar": <SubscriptionCalendarDemo />,

  tabs: <TabsDemo />,

  "toggle-group": <ToggleGroupDemo />,

  tooltip: <TooltipDemo />,

  "user-avatar": (
    <div className="grid gap-6">
      <AvatarVariant label="multiple · md · overflow +1 · invertOverlap" invertOverlap users={[...AVATAR_USERS]} max={4} />
      <AvatarVariant label="single · tooltip" mode="single" user={{ name: "Ada Lovelace", presence: "online" }} />
      <AvatarVariant label="single · no tooltip" mode="single" tooltip={false} user={{ name: "Ada Lovelace" }} />
      <AvatarVariant
        label="multiple · presence on (online/offline/inactive)"
        showPresence
        users={[
          { name: "Ada Lovelace", presence: "online" },
          { name: "Grace Hopper", presence: "offline" },
          { name: "Alan Turing", presence: "inactive" },
        ]}
        max={3}
      />
      <AvatarVariant label="multiple · sm · overflow +2" size="sm" users={[...AVATAR_USERS]} max={3} />
      <AvatarVariant label="multiple · onHover off" onHover={false} users={[...AVATAR_USERS]} max={4} />
    </div>
  ),
};

/** Proof exists for this slug? */
export function hasDemo(slug: string): boolean {
  return slug in DEMOS;
}
