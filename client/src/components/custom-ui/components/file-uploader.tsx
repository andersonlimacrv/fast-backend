import * as React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import {
  FaArrowRight,
  FaCheckCircle,
  FaCloudUploadAlt,
  FaExclamationCircle,
  FaFileAlt,
  FaFileCode,
  FaFileImage,
  FaFilePdf,
  FaFileVideo,
  FaShieldAlt,
  FaTimes,
} from "@/lib/icons";
import { cn } from "@/lib/utils";

/* File uploader: drag&drop + picker with simulated per-file progress.
 * Simulation only — persist via onSubmit in the parent. */

export type FileStatus = "queued" | "uploading" | "done" | "error";

export interface UploadedFile {
  id: string;
  file: File;
  progress: number;
  status: FileStatus;
}

export interface FileUploaderProps {
  /** Card heading */
  title?: string;
  /** Card sub-heading */
  description?: string;
  /** Maximum number of files allowed */
  maxFiles?: number;
  /** Maximum individual file size in MB */
  maxSizeMB?: number;
  /** Human-readable label for accepted formats */
  acceptedLabel?: string;
  /** Submit button label */
  submitLabel?: string;
  /** Cancel / discard button label */
  cancelLabel?: string;
  /** Fired on submit with the successfully uploaded files */
  onSubmit?: (files: File[]) => void;
  /** Fired on cancel */
  onCancel?: () => void;
}

function generateId(): string {
  return Math.random().toString(36).slice(2, 9);
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"] as const;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function FileIcon({ file }: { file: File }): React.ReactElement {
  const type = file.type;
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (type.startsWith("image/")) return <FaFileImage className="size-4" aria-hidden="true" />;
  if (type.startsWith("video/")) return <FaFileVideo className="size-4" aria-hidden="true" />;
  if (type === "application/pdf" || ext === "pdf") {
    return <FaFilePdf className="size-4" aria-hidden="true" />;
  }
  if (["js", "ts", "tsx", "jsx", "py", "go", "json", "yaml", "yml"].includes(ext)) {
    return <FaFileCode className="size-4" aria-hidden="true" />;
  }
  return <FaFileAlt className="size-4" aria-hidden="true" />;
}

export function FileUploader({
  title = "Submit Your Report",
  description = "Attach supporting documents to complete your submission.",
  maxFiles = 6,
  maxSizeMB = 25,
  acceptedLabel = "PDF, DOCX, XLSX, CSV · up to 25 MB each",
  submitLabel = "Submit Report",
  cancelLabel = "Discard",
  onSubmit,
  onCancel,
}: FileUploaderProps): React.ReactElement {
  const [files, setFiles] = React.useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const dragCounter = React.useRef(0);
  const timers = React.useRef(new Map<string, ReturnType<typeof setInterval>>());

  React.useEffect(
    () => () => {
      timers.current.forEach((t) => clearInterval(t));
      timers.current.clear();
    },
    [],
  );

  const totalSize = files.reduce((acc, f) => acc + f.file.size, 0);
  const allDone = files.length > 0 && files.every((f) => f.status === "done");
  const hasUploading = files.some((f) => f.status === "uploading" || f.status === "queued");
  const isAtLimit = files.length >= maxFiles;

  function simulateUpload(id: string): void {
    let progress = 0;
    setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, status: "uploading" } : f)));
    const interval = setInterval(() => {
      progress += Math.random() * 18 + 4;
      if (progress >= 100) {
        clearInterval(interval);
        timers.current.delete(id);
        setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, progress: 100, status: "done" } : f)));
      } else {
        setFiles((prev) =>
          prev.map((f) => (f.id === id ? { ...f, progress: Math.min(progress, 99) } : f)),
        );
      }
    }, 180);
    timers.current.set(id, interval);
  }

  function addFiles(incoming: FileList | File[]): void {
    const remaining = maxFiles - files.length;
    if (remaining <= 0) return;
    const toAdd: UploadedFile[] = Array.from(incoming)
      .filter((f) => f.size <= maxSizeMB * 1024 * 1024)
      .slice(0, remaining)
      .map((file) => ({ id: generateId(), file, progress: 0, status: "queued" as FileStatus }));
    if (toAdd.length === 0) return;
    setFiles((prev) => [...prev, ...toAdd]);
    toAdd.forEach((f) => {
      window.setTimeout(() => simulateUpload(f.id), 80);
    });
  }

  function removeFile(id: string): void {
    const t = timers.current.get(id);
    if (t) {
      clearInterval(t);
      timers.current.delete(id);
    }
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }

  function clearAll(): void {
    timers.current.forEach((t) => clearInterval(t));
    timers.current.clear();
    setFiles([]);
    if (inputRef.current) inputRef.current.value = "";
  }

  function handleDragEnter(e: React.DragEvent<HTMLButtonElement>): void {
    e.preventDefault();
    dragCounter.current += 1;
    setIsDragging(true);
  }

  function handleDragLeave(e: React.DragEvent<HTMLButtonElement>): void {
    e.preventDefault();
    dragCounter.current -= 1;
    if (dragCounter.current <= 0) {
      dragCounter.current = 0;
      setIsDragging(false);
    }
  }

  function handleDragOver(e: React.DragEvent<HTMLButtonElement>): void {
    e.preventDefault();
  }

  function handleDrop(e: React.DragEvent<HTMLButtonElement>): void {
    e.preventDefault();
    dragCounter.current = 0;
    setIsDragging(false);
    if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>): void {
    if (e.target.files?.length) addFiles(e.target.files);
    e.target.value = "";
  }

  function handleSubmit(): void {
    onSubmit?.(files.filter((f) => f.status === "done").map((f) => f.file));
  }

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            <h2 className="text-base leading-snug font-semibold tracking-tight text-foreground">
              {title}
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
          </div>
          {files.length > 0 && (
            <Badge variant="secondary" className="shrink-0 tabular-nums">
              {files.length} / {maxFiles}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        {!isAtLimit && (
          <button
            type="button"
            id="file-upload-drop-zone"
            aria-label="Drag and drop files or click to browse"
            onClick={() => inputRef.current?.click()}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className={cn(
              "relative flex w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-lg",
              "border-2 border-dashed py-8 transition-colors duration-200 motion-reduce:transition-none",
              "focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
              isDragging
                ? "border-primary bg-primary/5"
                : "border-border bg-muted/40 hover:border-primary/50 hover:bg-muted/60",
            )}
          >
            <span
              className={cn(
                "flex size-11 items-center justify-center rounded-lg border transition-colors duration-200",
                "motion-reduce:transition-none",
                isDragging
                  ? "border-primary/30 bg-primary/10 text-primary"
                  : "border-border bg-background text-muted-foreground",
              )}
            >
              <FaCloudUploadAlt className="size-5" aria-hidden="true" />
            </span>
            <span className="flex flex-col items-center gap-1 text-center">
              <span className="text-sm font-medium text-foreground">
                {isDragging ? "Release to add files" : "Drag & drop or click to browse"}
              </span>
              <span className="text-xs text-muted-foreground">{acceptedLabel}</span>
            </span>
          </button>
        )}

        {files.length > 0 && (
          <div className="flex flex-col gap-2">
            {files.map((uf) => (
              <div
                key={uf.id}
                className="flex flex-col gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2.5"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      "shrink-0",
                      uf.status === "error"
                        ? "text-destructive"
                        : uf.status === "done"
                          ? "text-primary"
                          : "text-muted-foreground",
                    )}
                  >
                    <FileIcon file={uf.file} />
                  </span>
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <p className="truncate text-sm leading-none font-medium text-foreground">
                      {uf.file.name}
                    </p>
                    <p className="text-xs text-muted-foreground">{formatBytes(uf.file.size)}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {uf.status === "done" && (
                      <FaCheckCircle className="size-3.5 text-primary" aria-hidden="true" />
                    )}
                    {uf.status === "error" && (
                      <FaExclamationCircle className="size-3.5 text-destructive" aria-hidden="true" />
                    )}
                    {(uf.status === "uploading" || uf.status === "queued") && (
                      <span className="text-xs text-muted-foreground tabular-nums">
                        {Math.round(uf.progress)}%
                      </span>
                    )}
                    <button
                      type="button"
                      id={`remove-file-${uf.id}`}
                      aria-label={`Remove ${uf.file.name}`}
                      onClick={() => removeFile(uf.id)}
                      className="text-muted-foreground transition-colors duration-150 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <FaTimes className="size-3.5" aria-hidden="true" />
                    </button>
                  </div>
                </div>
                {(uf.status === "uploading" || uf.status === "queued") && (
                  <div
                    role="progressbar"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={Math.round(uf.progress)}
                    aria-label={`Upload progress for ${uf.file.name}`}
                    className="h-1 overflow-hidden rounded-full bg-muted"
                  >
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-200 motion-reduce:transition-none"
                      style={{ width: `${uf.progress}%` }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {files.length > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {files.length} file{files.length !== 1 ? "s" : ""} · {formatBytes(totalSize)} total
            </span>
            {!hasUploading && (
              <button
                type="button"
                id="file-upload-clear-all"
                onClick={clearAll}
                className="text-xs text-muted-foreground transition-colors duration-150 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Clear all
              </button>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <FaShieldAlt className="size-3" aria-hidden="true" />
          <span className="text-xs">256-bit encrypted</span>
        </div>
        <div className="flex items-center gap-2">
          <Button id="file-upload-cancel" variant="outline" size="sm" onClick={onCancel ?? clearAll}>
            {cancelLabel}
          </Button>
          <Button
            id="file-upload-submit"
            variant="default"
            size="sm"
            disabled={!allDone}
            onClick={handleSubmit}
            className="gap-1.5"
          >
            {submitLabel}
            <FaArrowRight className="size-3" aria-hidden="true" />
          </Button>
        </div>
      </CardFooter>

      <input
        ref={inputRef}
        id="file-upload-input"
        type="file"
        multiple
        tabIndex={-1}
        className="sr-only"
        onChange={handleInputChange}
        aria-hidden="true"
      />
    </Card>
  );
}
