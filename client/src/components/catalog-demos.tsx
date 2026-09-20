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
import { ThemeToggle } from "@/components/theme-toggle";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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
} from "@/components/ui/dialog";
import { FileTree, type FileTreeNode } from "@/components/custom-ui/components/file-tree";
import { FileUploader } from "@/components/custom-ui/components/file-uploader";
import { FloatingInput } from "@/components/custom-ui/components/floating-input";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioItem } from "@/components/ui/radio";
import { RunActionButton } from "@/components/custom-ui/components/run-action-button";
import { Tabs, TabsContent, TabsList, TabsPanels, TabsTrigger } from "@/components/ui/tabs";
import { ToggleGroup, ToggleItem } from "@/components/ui/toggle-group";
import { ROUTES } from "@/lib/constants";
import { Bold, Italic, Underline } from "@/lib/icons";

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
    <div className="grid gap-6 lg:grid-cols-2">
      <div>
        <p className="mb-2 text-xs font-medium text-muted-foreground">Single (default)</p>
        <AccordionSingle />
      </div>
      <AccordionMultiple />
    </div>
  ),

  "alert-dialog": (
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
  ),

  "animated-circular-progress-bar": (
    <div className="flex flex-wrap items-center gap-6">
      <CircularProgress value={62} size={96} />
      <CircularProgress value={24} size={96} />
      <CircularProgress value={91} size={96} />
    </div>
  ),

  checkbox: (
    <div className="flex flex-wrap items-center gap-4">
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
    </div>
  ),

  "copy-button": (
    <div className="flex items-center gap-2">
      <code className="rounded-md bg-muted px-2 py-1 font-mono text-xs">org-123</code>
      <CopyButton content="org-123" />
    </div>
  ),

  "credit-usage-card": <CreditUsageCard />,

  dialog: (
    <Dialog>
      <DialogTrigger className={buttonVariants({ variant: "outline" })}>New project</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New project</DialogTitle>
          <DialogDescription>Projects live inside the active organization.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 py-2">
          <FloatingInput label="Project name" />
        </div>
        <DialogFooter>
          <DialogClose className={buttonVariants({ variant: "outline" })}>Cancel</DialogClose>
          <Button>Create</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),

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
