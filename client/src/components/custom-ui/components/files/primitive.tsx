/* Files primitive: the upstream `@animate-ui/primitives-base-files` API
 * rewired onto OUR accordion system (owner: same behavior as our Accordion —
 * folders must not open with a dry snap). `Files`/`FolderItem` run on our
 * `custom-ui/accordion` (multiple + controlled open state); triggers and
 * panels run on our `custom-ui/collapsible` primitives — so folder
 * expand/collapse animates exactly like the validated Accordion (`mask`
 * reveal, spring 150/22, both directions, reduced-motion).
 *
 * Local adaptations vs the registry: 'use client' removed (Vite);
 * reduced-motion collapses the folder-icon swap; `FolderHeader` is a plain
 * div (our accordion has no header part); `FolderItem` neutralizes our
 * accordion's row separator (`border-b-0`); `FolderPanel` forces the `mask`
 * reveal with the Accordion spring. Behavior source:
 * https://animate-ui.com/r/primitives-base-files.json */

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion, type HTMLMotionProps } from "motion/react";

import { Accordion, AccordionItem } from "../accordion";
import { CollapsibleContent, CollapsibleTrigger } from "../collapsible";
import {
  Highlight,
  HighlightItem,
  type HighlightItemProps,
  type HighlightProps,
} from "@/components/custom-ui/effects/highlight";
import { getStrictContext } from "@/lib/get-strict-context";
import { useControlledState } from "@/hooks/use-controlled-state";
import { cn } from "@/lib/utils";

type FilesContextType = {
  open: string[];
};

type FolderContextType = {
  isOpen: boolean;
};

const [FilesProvider, useFiles] = getStrictContext<FilesContextType>("FilesContext");

const [FolderProvider, useFolder] = getStrictContext<FolderContextType>("FolderContext");

type FilesProps = {
  children: React.ReactNode;
  defaultOpen?: string[];
  open?: string[];
  onOpenChange?: (open: string[]) => void;
} & Omit<
  React.ComponentProps<typeof Accordion>,
  "multiple" | "onHover" | "defaultValue" | "value" | "onValueChange" | "children"
>;

function Files({ children, defaultOpen, open, onOpenChange, style, ...props }: FilesProps) {
  const [openValue, setOpenValue] = useControlledState({
    value: open,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });

  return (
    <FilesProvider value={{ open: openValue ?? [] }}>
      <Accordion
        data-slot="files"
        multiple
        defaultValue={defaultOpen}
        value={open}
        onValueChange={setOpenValue}
        style={{
          position: "relative",
          overflow: "auto",
          ...style,
        }}
        {...props}
      >
        {children}
      </Accordion>
    </FilesProvider>
  );
}

type FilesHighlightProps = Omit<HighlightProps, "controlledItems" | "mode">;

function FilesHighlight({ hover = true, ...props }: FilesHighlightProps) {
  return <Highlight data-slot="files-highlight" controlledItems mode="parent" hover={hover} {...props} />;
}

type FolderItemProps = React.ComponentProps<typeof AccordionItem>;

function FolderItem({ value, className, ...props }: FolderItemProps) {
  const { open } = useFiles();

  return (
    <FolderProvider value={{ isOpen: open.includes(value) }}>
      <AccordionItem value={value} data-slot="folder-item" className={cn("border-b-0", className)} {...props} />
    </FolderProvider>
  );
}

type FolderHeaderProps = React.ComponentProps<"div">;

function FolderHeader(props: FolderHeaderProps) {
  return <div data-slot="folder-header" {...props} />;
}

type FolderTriggerProps = React.ComponentProps<typeof CollapsibleTrigger>;

function FolderTrigger(props: FolderTriggerProps) {
  return <CollapsibleTrigger data-slot="folder-trigger" {...props} />;
}

/* Same default as our Accordion (PANEL_SPRING): folders behave exactly like
 * it. Kept local so this primitive never reaches back into accordion.tsx. */
const FOLDER_PANEL_SPRING = { type: "spring", stiffness: 150, damping: 22 } as const;

type FolderPanelProps = React.ComponentProps<typeof CollapsibleContent>;

function FolderPanel({ children, ...props }: FolderPanelProps) {
  return (
    <CollapsibleContent reveal="mask" transition={FOLDER_PANEL_SPRING} {...props}>
      {children}
    </CollapsibleContent>
  );
}

type FileHighlightProps = HighlightItemProps;

function FileHighlight(props: FileHighlightProps) {
  return <HighlightItem data-slot="file-highlight" {...props} />;
}

type FileProps = React.ComponentProps<"div">;

function File(props: FileProps) {
  return <div data-slot="file" {...props} />;
}

type FileIconProps = React.ComponentProps<"span">;

function FileIcon(props: FileIconProps) {
  return <span data-slot="file-icon" {...props} />;
}

type FileLabelProps = React.ComponentProps<"span">;

function FileLabel(props: FileLabelProps) {
  return <span data-slot="file-label" {...props} />;
}

type FolderHighlightProps = HighlightItemProps;

function FolderHighlight(props: FolderHighlightProps) {
  return <HighlightItem data-slot="folder-highlight" {...props} />;
}

type FolderProps = React.ComponentProps<"div">;

function Folder(props: FolderProps) {
  return <div data-slot="folder" {...props} />;
}

type FolderIconProps = HTMLMotionProps<"span"> & {
  closeIcon: React.ReactNode;
  openIcon: React.ReactNode;
};

function FolderIcon({ closeIcon, openIcon, transition = { duration: 0.15 }, ...props }: FolderIconProps) {
  const { isOpen } = useFolder();
  const reduceMotion = useReducedMotion();

  return (
    <AnimatePresence mode="wait">
      <motion.span
        key={isOpen ? "open" : "close"}
        data-slot="folder-icon"
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.9 }}
        transition={reduceMotion ? { duration: 0 } : transition}
        {...props}
      >
        {isOpen ? openIcon : closeIcon}
      </motion.span>
    </AnimatePresence>
  );
}

type FolderLabelProps = React.ComponentProps<"span">;

function FolderLabel(props: FolderLabelProps) {
  return <span data-slot="folder-label" {...props} />;
}

export {
  Files,
  FilesHighlight,
  FolderItem,
  FolderHeader,
  FolderTrigger,
  FolderPanel,
  FileHighlight,
  File,
  FileIcon,
  FileLabel,
  FolderHighlight,
  Folder,
  FolderIcon,
  FolderLabel,
  useFiles,
  useFolder,
  type FilesProps,
  type FilesHighlightProps,
  type FolderItemProps,
  type FolderHeaderProps,
  type FolderTriggerProps,
  type FolderPanelProps,
  type FileHighlightProps,
  type FileProps,
  type FileIconProps,
  type FileLabelProps,
  type FolderHighlightProps,
  type FolderProps,
  type FolderIconProps,
  type FolderLabelProps,
  type FilesContextType,
  type FolderContextType,
};
