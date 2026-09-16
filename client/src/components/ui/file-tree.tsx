import { Accordion } from "@base-ui/react/accordion";
import * as React from "react";

import { ChevronRight, FileCode, FileText, FolderOpen } from "@/lib/icons";
import { cn } from "@/lib/utils";

/* File tree on Base-UI accordion (upstream base-files shape, our tokens).
 * Folders get keyboard navigation from Accordion.Trigger; files are buttons.
 * Single folder glyph: icon source exposes FolderOpen only (no FolderClosed). */

export interface FileTreeNode {
  id: string;
  name: string;
  type: "file" | "folder";
  children?: FileTreeNode[];
  gitStatus?: "untracked" | "modified" | "deleted";
}

export interface FileTreeProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onSelect"> {
  nodes: FileTreeNode[];
  defaultExpanded?: string[];
  onSelect?: (node: FileTreeNode) => void;
}

const CODE_EXTS = new Set([
  "ts",
  "tsx",
  "js",
  "jsx",
  "json",
  "css",
  "py",
  "go",
  "rs",
  "mdx",
]);

function fileIcon(name: string): typeof FileText {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  return CODE_EXTS.has(ext) ? FileCode : FileText;
}

const GIT_DOT: Record<NonNullable<FileTreeNode["gitStatus"]>, string> = {
  modified: "bg-primary",
  untracked: "bg-muted-foreground",
  deleted: "bg-destructive",
};

function GitDot({ status }: { status: NonNullable<FileTreeNode["gitStatus"]> }) {
  return (
    <span
      aria-hidden="true"
      title={status}
      className={cn("ml-auto size-1.5 shrink-0 rounded-full", GIT_DOT[status])}
    />
  );
}

const ROW_CLASS = cn(
  "flex w-full items-center gap-1.5 rounded-md px-1.5 py-1 text-left text-sm",
  "text-muted-foreground outline-none hover:bg-accent hover:text-accent-foreground",
  "focus-visible:ring-2 focus-visible:ring-ring",
);

function FileRow({ node, onSelect }: { node: FileTreeNode; onSelect?: (node: FileTreeNode) => void }) {
  const Icon = fileIcon(node.name);
  return (
    <li>
      <button type="button" onClick={() => onSelect?.(node)} aria-label={node.name} className={ROW_CLASS}>
        <Icon className="size-4 shrink-0" aria-hidden="true" />
        <span className="truncate">{node.name}</span>
        {node.gitStatus && <GitDot status={node.gitStatus} />}
      </button>
    </li>
  );
}

function FolderRow({
  node,
  defaultExpanded,
  onSelect,
}: {
  node: FileTreeNode;
  defaultExpanded?: string[];
  onSelect?: (node: FileTreeNode) => void;
}) {
  return (
    <li>
      <Accordion.Item value={node.id}>
        <Accordion.Header>
          <Accordion.Trigger onClick={() => onSelect?.(node)} aria-label={node.name} className={ROW_CLASS}>
            <ChevronRight
              className="size-3.5 shrink-0 transition-transform duration-150 data-[panel-open]:rotate-90"
              aria-hidden="true"
            />
            <FolderOpen className="size-4 shrink-0" aria-hidden="true" />
            <span className="truncate">{node.name}</span>
            {node.gitStatus && <GitDot status={node.gitStatus} />}
          </Accordion.Trigger>
        </Accordion.Header>
        {node.children && node.children.length > 0 && (
          <Accordion.Panel className="overflow-hidden">
            <TreeLevel nodes={node.children} defaultExpanded={defaultExpanded} onSelect={onSelect} nested />
          </Accordion.Panel>
        )}
      </Accordion.Item>
    </li>
  );
}

function TreeLevel({
  nodes,
  defaultExpanded,
  onSelect,
  nested = false,
}: {
  nodes: FileTreeNode[];
  defaultExpanded?: string[];
  onSelect?: (node: FileTreeNode) => void;
  nested?: boolean;
}) {
  return (
    <Accordion.Root
      multiple
      defaultValue={defaultExpanded}
      className={cn(nested && "mt-0.5 ml-3 border-l border-border pl-1")}
    >
      <ul className="flex flex-col gap-px">
        {nodes.map((node) =>
          node.type === "folder" ? (
            <FolderRow key={node.id} node={node} defaultExpanded={defaultExpanded} onSelect={onSelect} />
          ) : (
            <FileRow key={node.id} node={node} onSelect={onSelect} />
          ),
        )}
      </ul>
    </Accordion.Root>
  );
}

export function FileTree({ nodes, defaultExpanded, onSelect, className, ...props }: FileTreeProps) {
  return (
    <div className={cn("w-full", className)} {...props}>
      <TreeLevel nodes={nodes} defaultExpanded={defaultExpanded} onSelect={onSelect} />
    </div>
  );
}
