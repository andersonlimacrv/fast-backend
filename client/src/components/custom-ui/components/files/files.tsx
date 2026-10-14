/* Composed Files port (change `custom-ui-files`): the upstream
 * `components-base-files` over our vendored primitive, onto our tokens.
 *
 * `Files` (`p-2 w-full` + the `bg-accent rounded-lg` hover highlight),
 * `SubFiles`, `FolderTrigger` (label + `gitStatus`), `FolderPanel` (guide
 * `ml-6 before:bg-border`) and `FileItem` (`icon` + `gitStatus`) — icons via
 * `lib/icons`, `size-4.5` glyphs, `text-sm` labels.
 *
 * Local deltas: NO `onSelect` (faithful to the upstream — files are plain
 * divs; folders stay keyboard-accessible through the accordion triggers);
 * git colors come only from `index.css` (`deleted` → `destructive`,
 * `untracked` → `chart-2`, `modified` → `chart-4`, letters U/M/D carrying the
 * meaning); the trigger gets the house `ring-2` focus (DESIGN.md §8 —
 * upstream ships none and our preflight kills native outlines); decorative
 * dots are `aria-hidden` (the letters carry the state). */

import * as React from "react";

import {
  Files as FilesPrimitive,
  FilesHighlight as FilesHighlightPrimitive,
  FolderItem as FolderItemPrimitive,
  FolderHeader as FolderHeaderPrimitive,
  FolderTrigger as FolderTriggerPrimitive,
  FolderHighlight as FolderHighlightPrimitive,
  Folder as FolderPrimitive,
  FolderIcon as FolderIconPrimitive,
  FileLabel as FileLabelPrimitive,
  FolderPanel as FolderPanelPrimitive,
  FileHighlight as FileHighlightPrimitive,
  File as FilePrimitive,
  FileIcon as FileIconPrimitive,
  type FilesProps as FilesPrimitiveProps,
  type FolderItemProps as FolderItemPrimitiveProps,
  type FolderPanelProps as FolderPanelPrimitiveProps,
  type FileProps as FilePrimitiveProps,
  type FileLabelProps as FileLabelPrimitiveProps,
} from "./primitive";
import { cn } from "@/lib/utils";
import { File, Folder, FolderOpen } from "@/lib/icons";

type GitStatus = "untracked" | "modified" | "deleted";

const GIT_TEXT: Record<GitStatus, string> = {
  untracked: "text-chart-2",
  modified: "text-chart-4",
  deleted: "text-destructive",
};

const GIT_DOT: Record<GitStatus, string> = {
  untracked: "bg-chart-2",
  modified: "bg-chart-4",
  deleted: "bg-destructive",
};

type FilesProps = FilesPrimitiveProps;

function Files({ className, children, ...props }: FilesProps) {
  return (
    <FilesPrimitive className={cn("w-full p-2", className)} {...props}>
      <FilesHighlightPrimitive className="bg-accent pointer-events-none rounded-lg">
        {children}
      </FilesHighlightPrimitive>
    </FilesPrimitive>
  );
}

type SubFilesProps = FilesProps;

function SubFiles(props: SubFilesProps) {
  return <FilesPrimitive {...props} />;
}

type FolderItemProps = FolderItemPrimitiveProps;

function FolderItem(props: FolderItemProps) {
  return <FolderItemPrimitive {...props} />;
}

type FolderTriggerProps = FileLabelPrimitiveProps & {
  gitStatus?: GitStatus;
};

function FolderTrigger({ children, className, gitStatus, ...props }: FolderTriggerProps) {
  return (
    <FolderHeaderPrimitive>
      <FolderTriggerPrimitive className="w-full text-start focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none">
        <FolderHighlightPrimitive>
          <FolderPrimitive className="pointer-events-none flex items-center justify-between gap-2 p-2">
            <div className={cn("flex items-center gap-2", gitStatus && GIT_TEXT[gitStatus])}>
              <FolderIconPrimitive
                closeIcon={<Folder className="size-4.5" aria-hidden="true" />}
                openIcon={<FolderOpen className="size-4.5" aria-hidden="true" />}
              />
              <FileLabelPrimitive className={cn("text-sm", className)} {...props}>
                {children}
              </FileLabelPrimitive>
            </div>
            {gitStatus && (
              <span aria-hidden="true" className={cn("size-2 rounded-full", GIT_DOT[gitStatus])} />
            )}
          </FolderPrimitive>
        </FolderHighlightPrimitive>
      </FolderTriggerPrimitive>
    </FolderHeaderPrimitive>
  );
}

type FolderPanelProps = FolderPanelPrimitiveProps;

function FolderPanel(props: FolderPanelProps) {
  return (
    <div className="relative ml-6 before:absolute before:-left-2 before:inset-y-0 before:h-full before:w-px before:bg-border">
      <FolderPanelPrimitive {...props} />
    </div>
  );
}

type FileItemProps = FilePrimitiveProps & {
  icon?: React.ElementType;
  gitStatus?: GitStatus;
};

function FileItem({ icon: Icon = File, className, children, gitStatus, ...props }: FileItemProps) {
  return (
    <FileHighlightPrimitive>
      <FilePrimitive
        className={cn(
          "pointer-events-none flex items-center justify-between gap-2 p-2",
          gitStatus && GIT_TEXT[gitStatus],
        )}
      >
        <div className="flex items-center gap-2">
          <FileIconPrimitive>
            <Icon className="size-4.5" aria-hidden="true" />
          </FileIconPrimitive>
          <FileLabelPrimitive className={cn("text-sm", className)} {...props}>
            {children}
          </FileLabelPrimitive>
        </div>
        {gitStatus && (
          <span className="text-sm font-medium">
            {gitStatus === "untracked" && "U"}
            {gitStatus === "modified" && "M"}
            {gitStatus === "deleted" && "D"}
          </span>
        )}
      </FilePrimitive>
    </FileHighlightPrimitive>
  );
}

export {
  Files,
  FolderItem,
  FolderTrigger,
  FolderPanel,
  FileItem,
  SubFiles,
  type FilesProps,
  type FolderItemProps,
  type FolderTriggerProps,
  type FolderPanelProps,
  type FileItemProps,
  type SubFilesProps,
};
