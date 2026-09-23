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

import { AvatarGroup } from "@/components/avatar-group";
import { CreditUsageCard } from "@/components/billing/credit-usage-card";
import { EmptyState, ErrorOne, defaultErrorOneAction } from "@/components/error-state";
import { Switch } from "@/components/custom-ui/components/switch";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/custom-ui/components/accordion";
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
import { FileTree, type FileTreeNode } from "@/components/custom-ui/components/file-tree";
import { FileUploader } from "@/components/custom-ui/components/file-uploader";
import { FloatingInput } from "@/components/custom-ui/components/floating-input";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioItem } from "@/components/ui/radio";
import { RunActionButton } from "@/components/custom-ui/components/run-action-button";
import { Tabs, TabsContent, TabsList, TabsPanels, TabsTrigger } from "@/components/ui/tabs";
import { ToggleGroup, ToggleItem } from "@/components/ui/toggle-group";
import { ROUTES } from "@/lib/constants";
import { Bold, Check, Italic, Underline, X } from "@/lib/icons";

/* ---------- stateful wrappers (hooks need a component boundary) ---------- */

function FileTreeDemo() {
  const [note, setNote] = React.useState("Select a file to preview its id.");
  return (
    <div>
      <FileTree nodes={TREE} defaultExpanded={["src"]} onSelect={(n) => setNote(`Selected: ${n.id}`)} />
      <p className="mt-2 text-xs text-muted-foreground" aria-live="polite">
        {note}
      </p>
    </div>
  );
}

/* ---------- demos ---------- */

const TREE: FileTreeNode[] = [
  {
    id: "src",
    name: "src",
    type: "folder",
    children: [
      {
        id: "components",
        name: "components",
        type: "folder",
        children: [
          { id: "sidebar", name: "app-sidebar.tsx", type: "file", gitStatus: "modified" },
          { id: "icons", name: "icons.tsx", type: "file" },
        ],
      },
      { id: "main", name: "main.tsx", type: "file" },
      { id: "readme", name: "notes.txt", type: "file", gitStatus: "untracked" },
    ],
  },
];

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

  "credit-usage-card": <CreditUsageCard />,

  dialog: <DialogDemo />,

  "file-tree": <FileTreeDemo />,

  "file-upload": <FileUploader />,

  inputs: (
    <div className="grid max-w-sm gap-4">
      <FloatingInput label="Project name" />
      <FloatingInput label="Disabled" disabled />
      <Input placeholder="Plain input (ui/input)" />
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
    <EmptyState
      title="The shell around this page is the demo"
      description="Drawer below md, icon rail md–xl, expanded above xl, preference in a cookie."
    />
  ),

  "switch-mode-toggle": <ThemeToggle />,

  tabs: (
    <Tabs defaultValue="account">
      <TabsList>
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="quota">Quota</TabsTrigger>
      </TabsList>
      <TabsPanels>
        <TabsContent value="account">
          <p className="text-sm text-muted-foreground">Profile fields live here.</p>
        </TabsContent>
        <TabsContent value="quota">
          <div className="flex items-center gap-4">
            <CircularProgress value={62} size={96} />
            <p className="text-sm text-muted-foreground">Taller panel — the wrapper animates height.</p>
          </div>
        </TabsContent>
      </TabsPanels>
    </Tabs>
  ),

  "toggle-group": (
    <ToggleGroup defaultValue={["bold"]} aria-label="text style">
      <ToggleItem value="bold" aria-label="bold">
        <Bold aria-hidden="true" />
      </ToggleItem>
      <ToggleItem value="italic" aria-label="italic">
        <Italic aria-hidden="true" />
      </ToggleItem>
      <ToggleItem value="underline" aria-label="underline">
        <Underline aria-hidden="true" />
      </ToggleItem>
    </ToggleGroup>
  ),

  "user-avatar": (
    <AvatarGroup
      users={[
        { name: "Ada Lovelace", presence: "online" },
        { name: "Alan Turing", presence: "online" },
        { name: "Grace Hopper", presence: "offline" },
        { name: "Edsger Dijkstra", presence: "offline" },
        { name: "Barbara Liskov", presence: "online" },
      ]}
      max={4}
    />
  ),
};

/** Proof exists for this slug? */
export function hasDemo(slug: string): boolean {
  return slug in DEMOS;
}
