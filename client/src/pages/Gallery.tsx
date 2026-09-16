import * as React from "react";

import { AvatarGroup } from "@/components/avatar-group";
import { PageHeader } from "@/components/feedback";
import { RequireStaff } from "@/components/require-staff";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { CircularProgress } from "@/components/ui/circular-progress";
import { CopyButton } from "@/components/ui/copy-button";
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
import { FileTree, type FileTreeNode } from "@/components/ui/file-tree";
import { FloatingInput } from "@/components/ui/floating-input";
import { KpiCard } from "@/components/ui/kpi-card";
import { RadioGroup, RadioItem } from "@/components/ui/radio";
import { Tabs, TabsContent, TabsList, TabsPanels, TabsTrigger } from "@/components/ui/tabs";
import { ToggleGroup, ToggleItem } from "@/components/ui/toggle-group";
import { KpiGrid } from "@/components/kpi-grid";
import { Bold, Italic, Underline } from "@/lib/icons";

/* Staff-only visual catalog: the 11 Animate UI DEMOs adapted to our tokens
 * (neutral data, no console.log). Doubles as e2e axe/snapshot coverage.
 * Not part of the public bundle story — RequireStaff + backend 403. */

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

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

export function GalleryPage() {
  const [treeNote, setTreeNote] = React.useState("Select a file to preview its id.");
  return (
    <RequireStaff title="Component gallery">
      <PageHeader
        title="Component gallery"
        description="Animate UI DEMOs adapted to our theme (staff-only visual catalog)."
      />
      <div className="grid gap-4 lg:grid-cols-2">
        <Section title="1 · Accordion (spring presets)">
          <Accordion>
            <AccordionItem value="a">
              <AccordionTrigger>Refund policy</AccordionTrigger>
              <AccordionContent>Refunds are issued within 30 days of purchase.</AccordionContent>
            </AccordionItem>
            <AccordionItem value="b">
              <AccordionTrigger>Data retention</AccordionTrigger>
              <AccordionContent>Audit rows are append-only; see the retention runbook.</AccordionContent>
            </AccordionItem>
          </Accordion>
        </Section>

        <Section title="2 · AlertDialog (destructive confirm)">
          <AlertDialog>
            <AlertDialogTrigger className={buttonVariants({ variant: "destructive" })}>
              Delete organization
            </AlertDialogTrigger>
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
        </Section>

        <Section title="3 · Checkbox (variants + sizes)">
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
        </Section>

        <Section title="4 · CopyButton (hover/tap scale)">
          <div className="flex items-center gap-2">
            <code className="rounded-md bg-muted px-2 py-1 font-mono text-xs">org-123</code>
            <CopyButton content="org-123" />
          </div>
        </Section>

        <Section title="5 · Dialog (CRUD form)">
          <Dialog>
            <DialogTrigger className={buttonVariants({ variant: "outline" })}>
              New project
            </DialogTrigger>
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
        </Section>

        <Section title="6 · Radio (roles)">
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
        </Section>

        <Section title="7 · Tabs (TabsPanels + AutoHeight)">
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
                  <p className="text-sm text-muted-foreground">
                    Taller panel — the wrapper animates height.
                  </p>
                </div>
              </TabsContent>
            </TabsPanels>
          </Tabs>
        </Section>

        <Section title="8 · ToggleGroup (text style)">
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
        </Section>

        <Section title="9 · AvatarGroup (presence)">
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
        </Section>

        <Section title="10 · FileTree (explorer)">
          <FileTree nodes={TREE} defaultExpanded={["src"]} onSelect={(n) => setTreeNote(`Selected: ${n.id}`)} />
          <p className="mt-2 text-xs text-muted-foreground" aria-live="polite">
            {treeNote}
          </p>
        </Section>

        <Section title="11 · Sidebar (this shell)">
          <p className="text-sm text-muted-foreground">
            The sidebar around this page <em>is</em> the demo: drawer below md, icon rail
            md–xl, expanded above xl, preference in a cookie. Upstream radix Sidebar was
            deliberately not adopted (see review-design §11).
          </p>
        </Section>

        <Section title="Bonus · KpiGrid (live region)">
          <KpiGrid>
            <KpiCard label="Demo users" value="1,024" delta={4} />
            <KpiCard label="Demo orgs" value="128" delta={-2} />
          </KpiGrid>
        </Section>
      </div>
    </RequireStaff>
  );
}
