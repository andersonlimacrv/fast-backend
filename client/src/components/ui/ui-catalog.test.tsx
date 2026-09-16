// @vitest-environment jsdom
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

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
import { Avatar, initialsOf } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { CircularProgress } from "@/components/ui/circular-progress";
import { CopyButton } from "@/components/ui/copy-button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FloatingInput } from "@/components/ui/floating-input";
import { RadioGroup, RadioItem } from "@/components/ui/radio";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ToggleGroup, ToggleItem } from "@/components/ui/toggle-group";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ThemeToggle } from "@/components/theme-toggle";
import { EmptyState } from "@/components/error-state";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe("tabs", () => {
  it("switches panels", () => {
    render(
      <Tabs defaultValue="a">
        <TabsList>
          <TabsTrigger value="a">Alpha</TabsTrigger>
          <TabsTrigger value="b">Beta</TabsTrigger>
        </TabsList>
        <TabsContent value="a">panel-a</TabsContent>
        <TabsContent value="b">panel-b</TabsContent>
      </Tabs>,
    );
    expect(screen.getByText("panel-a")).toBeTruthy();
    fireEvent.click(screen.getByRole("tab", { name: "Beta" }));
    expect(screen.getByText("panel-b")).toBeTruthy();
  });
});

describe("tooltip", () => {
  it("reveals content on focus", async () => {
    render(
      <Tooltip>
        <TooltipTrigger>hover me</TooltipTrigger>
        <TooltipContent>tip text</TooltipContent>
      </Tooltip>,
    );
    fireEvent.focus(screen.getByText("hover me"));
    expect(await screen.findByText("tip text")).toBeTruthy();
  });
});

describe("alert-dialog", () => {
  it("confirms and closes", async () => {
    const onConfirm = vi.fn();
    render(
      <AlertDialog>
        <AlertDialogTrigger>delete</AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>Irreversible.</AlertDialogDescription>
          <AlertDialogAction onClick={onConfirm}>Confirm</AlertDialogAction>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
        </AlertDialogContent>
      </AlertDialog>,
    );
    fireEvent.click(screen.getByText("delete"));
    expect(await screen.findByText("Are you sure?")).toBeTruthy();
    fireEvent.click(screen.getByText("Confirm"));
    expect(onConfirm).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(screen.queryByText("Are you sure?")).toBeNull());
  });
});

describe("checkbox", () => {
  it("toggles and reports", () => {
    const onChange = vi.fn();
    render(<Checkbox aria-label="accept" onCheckedChange={onChange} />);
    fireEvent.click(screen.getByRole("checkbox"));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.calls[0]?.[0]).toBe(true);
  });
});

describe("radio", () => {
  it("selects a value in the group", () => {
    const onChange = vi.fn();
    render(
      <RadioGroup aria-label="role" onValueChange={onChange}>
        <label>
          <RadioItem value="admin" /> admin
        </label>
        <label>
          <RadioItem value="member" /> member
        </label>
      </RadioGroup>,
    );
    fireEvent.click(screen.getByText("member"));
    expect(onChange).toHaveBeenCalledWith("member", expect.anything());
  });
});

describe("accordion", () => {
  it("expands its panel", async () => {
    render(
      <Accordion>
        <AccordionItem value="one">
          <AccordionTrigger>Section</AccordionTrigger>
          <AccordionContent>hidden body</AccordionContent>
        </AccordionItem>
      </Accordion>,
    );
    expect(screen.queryByText("hidden body")).toBeNull();
    fireEvent.click(screen.getByText("Section"));
    expect(await screen.findByText("hidden body")).toBeTruthy();
  });
});

describe("switch", () => {
  it("toggles on click", () => {
    const onChange = vi.fn();
    render(<Switch aria-label="enabled" onCheckedChange={onChange} />);
    fireEvent.click(screen.getByRole("switch"));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.calls[0]?.[0]).toBe(true);
  });
});

describe("avatar", () => {
  it("renders initials", () => {
    expect(initialsOf("Ada Lovelace")).toBe("AL");
    expect(initialsOf("root")).toBe("RO");
    render(<Avatar name="Ada Lovelace" />);
    expect(screen.getByText("AL")).toBeTruthy();
  });
});

describe("copy-button", () => {
  it("copies and shows feedback, then resets", async () => {
    const writeText = vi.fn(async () => {});
    vi.stubGlobal("navigator", { clipboard: { writeText } });
    const onCopied = vi.fn();
    render(<CopyButton content="org-123" delay={20} onCopiedChange={onCopied} />);
    fireEvent.click(screen.getByRole("button", { name: /copy to clipboard/i }));
    expect(writeText).toHaveBeenCalledWith("org-123");
    expect(await screen.findByRole("button", { name: /copied/i })).toBeTruthy();
    expect(onCopied).toHaveBeenCalledWith(true, "org-123");
    await waitFor(() => expect(screen.getByRole("button", { name: /copy to clipboard/i })).toBeTruthy());
  });
});

describe("dialog", () => {
  it("opens and closes", async () => {
    render(
      <Dialog>
        <DialogTrigger>new project</DialogTrigger>
        <DialogContent>
          <DialogTitle>Create project</DialogTitle>
          <DialogDescription>Pick a name.</DialogDescription>
          <DialogClose>Close</DialogClose>
        </DialogContent>
      </Dialog>,
    );
    fireEvent.click(screen.getByText("new project"));
    expect(await screen.findByText("Create project")).toBeTruthy();
    fireEvent.click(screen.getByText("Close"));
    await waitFor(() => expect(screen.queryByText("Create project")).toBeNull());
  });
});

describe("toggle-group", () => {
  it("selects a single value", () => {
    const onChange = vi.fn();
    render(
      <ToggleGroup defaultValue={["bold"]} onValueChange={onChange} aria-label="style">
        <ToggleItem value="bold" aria-label="bold" />
        <ToggleItem value="italic" aria-label="italic" />
      </ToggleGroup>,
    );
    expect(screen.getByRole("button", { name: "bold" }).getAttribute("data-pressed")).not.toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "italic" }));
    expect(onChange).toHaveBeenCalledWith(["italic"], expect.anything());
  });
});

describe("floating-input", () => {
  it("associates label and accepts text", () => {
    render(<FloatingInput label="Email Address" type="email" />);
    const input = screen.getByLabelText("Email Address");
    fireEvent.change(input, { target: { value: "a@b.c" } });
    expect((input as HTMLInputElement).value).toBe("a@b.c");
  });
});

describe("circular-progress", () => {
  it("exposes value and clamps", () => {
    const { rerender } = render(<CircularProgress value={25} />);
    const bar = screen.getByRole("progressbar");
    expect(bar.getAttribute("aria-valuenow")).toBe("25");
    expect(bar.getAttribute("aria-valuetext")).toBe("25 percent");
    rerender(<CircularProgress value={150} />);
    expect(screen.getByRole("progressbar").getAttribute("aria-valuenow")).toBe("100");
  });
});

describe("theme-toggle", () => {
  it("flips the dark class", async () => {
    document.documentElement.classList.remove("dark");
    render(<ThemeToggle />);
    const toggle = await screen.findByRole("switch", { name: /dark mode/i });
    fireEvent.click(toggle);
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(await screen.findByRole("switch", { name: /light mode/i })).toBeTruthy();
    document.documentElement.classList.remove("dark");
  });
});

describe("empty-state", () => {
  it("renders title, description and action", () => {
    const onAction = vi.fn();
    render(
      <EmptyState title="No projects yet" description="Create one to start." actionLabel="New project" onAction={onAction} />,
    );
    expect(screen.getByText("No projects yet")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "New project" }));
    expect(onAction).toHaveBeenCalledTimes(1);
  });
});
