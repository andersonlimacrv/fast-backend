// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
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
import { CircularProgress } from "@/components/custom-ui/components/circular-progress";
import { Checkbox as CustomCheckbox } from "@/components/custom-ui/components/checkbox";
import { Switch as CustomSwitch } from "@/components/custom-ui/components/switch";
import { CopyButton } from "@/components/custom-ui/components/copy-button";
import { CreditUsageCard } from "@/components/billing/credit-usage-card";
import { ExpandDetails } from "@/components/custom-ui/components/expand-details";
import { SegmentedProgressBar } from "@/components/custom-ui/components/segmented-progress-bar";
import { SubscriptionCalendar, type SubscriptionDay } from "@/components/custom-ui/components/subscription-calendar";
import {
  Dialog as CustomDialog,
  DialogClose as CustomDialogClose,
  DialogContent as CustomDialogContent,
  DialogTitle as CustomDialogTitle,
  DialogTrigger as CustomDialogTrigger,
} from "@/components/custom-ui/components/dialog";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FloatingInput } from "@/components/custom-ui/components/floating-input";
import { RadioGroup, RadioItem } from "@/components/ui/radio";
import { Switch } from "@/components/ui/switch";
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/custom-ui/components/tooltip/tooltip";
import { ThemeToggle } from "@/components/theme-toggle";
import { EmptyState } from "@/components/error-state";
import { AvatarGroup } from "@/components/custom-ui/components/avatar-group/avatar-group";
import {
  FileItem,
  Files,
  FolderItem,
  FolderPanel,
  FolderTrigger,
  SubFiles,
} from "@/components/custom-ui/components/files/files";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/custom-ui/components/collapsible";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/custom-ui/components/dropdown-menu/dropdown-menu";
import { MemoryRouter } from "react-router-dom";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe("tabs legacy", () => {
  it("switches panels without the highlight wrappers", () => {
    render(
      <Tabs defaultValue="a" aria-label="legacy">
        <TabsList>
          <TabsTab value="a">Alpha</TabsTab>
          <TabsTab value="b">Beta</TabsTab>
        </TabsList>
        <TabsPanels>
          <TabsPanel value="a">panel-a</TabsPanel>
          <TabsPanel value="b">panel-b</TabsPanel>
        </TabsPanels>
      </Tabs>,
    );
    expect(screen.getByText("panel-a")).toBeTruthy();
    fireEvent.click(screen.getByRole("tab", { name: "Beta" }));
    expect(screen.getByText("panel-b")).toBeTruthy();
  });
});

describe("tooltip", () => {
  it("reveals content on hover", async () => {
    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>hover me</TooltipTrigger>
          <TooltipContent>tip text</TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    );
    fireEvent.mouseEnter(screen.getByText("hover me"));
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

describe("credit-usage-card", () => {
  // Radix menus open on the pointer sequence (real browsers send it natively).
  const openMenu = (trigger: HTMLElement) => {
    fireEvent.pointerDown(trigger, { pointerType: "mouse", button: 0 });
    fireEvent.mouseDown(trigger, { button: 0 });
    fireEvent.click(trigger);
  };

  it("uses the custom-ui switch and reports the auto-switch change", async () => {
    const onChange = vi.fn();
    render(<CreditUsageCard onAutoSwitchChange={onChange} />);
    const toggle = screen.getByRole("switch", { name: /auto-switch to cheaper model/i });
    expect(toggle.getAttribute("aria-checked")).toBe("true");
    /* The validated 25 Switch paints the active track with the full-strength
     * primary — the hand-rolled toggle it replaced used a `/15` tint. */
    expect(toggle.className).toContain("bg-primary");
    fireEvent.click(toggle);
    expect(onChange).toHaveBeenCalledWith(false);
    await waitFor(() => expect(toggle.getAttribute("aria-checked")).toBe("false"));
  });

  it("picks the usage period through the shared dropdown menu", async () => {
    render(<CreditUsageCard />);
    openMenu(screen.getByRole("button", { name: /select usage period/i }));
    expect(await screen.findByRole("menuitemradio", { name: "14 Days" })).toBeTruthy();
    fireEvent.click(screen.getByRole("menuitemradio", { name: "14 Days" }));
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /select usage period/i }).textContent).toContain("14 Days"),
    );
  });

  it("runs a usage action from the more menu", async () => {
    render(<CreditUsageCard />);
    openMenu(screen.getByRole("button", { name: "More actions" }));
    expect(await screen.findByRole("menuitem", { name: "Export CSV" })).toBeTruthy();
    expect(screen.getByRole("menuitem", { name: "Share report" })).toBeTruthy();
    fireEvent.click(screen.getByRole("menuitem", { name: "Refresh data" }));
    await waitFor(() => expect(screen.queryByRole("menuitem", { name: "Refresh data" })).toBeNull());
  });

  it("feeds the controlled value to the label and the segmented bar", () => {
    render(<CreditUsageCard usedCreditsPercent={25} animateOnMount={false} />);
    expect(screen.getByText("25.0%")).toBeTruthy();
    expect(screen.getByRole("progressbar", { name: "Credits used" }).getAttribute("aria-valuenow")).toBe("25");
  });

  it("fills the label and the bar from zero on mount by default", async () => {
    const { container } = render(<CreditUsageCard usedCreditsPercent={25} transitionLength={30} />);
    /* Painted value starts at 0 (label + bar) while aria already reports the
     * real value, mirroring the CircularProgress driver. */
    expect(screen.getByText("0.0%")).toBeTruthy();
    expect(container.firstElementChild?.getAttribute("data-current-value")).toBe("0");
    expect(screen.getByRole("progressbar", { name: "Credits used" }).getAttribute("aria-valuenow")).toBe("25");
    await waitFor(() => expect(screen.getByText("25.0%")).toBeTruthy());
  });

  it("sends prop changes instantly after the mount fill settles", async () => {
    const { container, rerender } = render(<CreditUsageCard usedCreditsPercent={25} transitionLength={30} />);
    await waitFor(() => expect(screen.getByText("25.0%")).toBeTruthy());
    rerender(<CreditUsageCard usedCreditsPercent={60} transitionLength={30} />);
    /* Entry-only: no tween chases the prop after mounting. */
    expect(screen.getByText("60.0%")).toBeTruthy();
    expect(container.firstElementChild?.getAttribute("data-current-value")).toBe("60");
  });

  it("cancels the running fill when the prop changes mid-flight", async () => {
    const { container, rerender } = render(<CreditUsageCard usedCreditsPercent={80} transitionLength={500} />);
    expect(screen.getByText("0.0%")).toBeTruthy();
    rerender(<CreditUsageCard usedCreditsPercent={30} transitionLength={500} />);
    /* The in-flight fill is stopped (cleanup) and the card follows at once. */
    expect(screen.getByText("30.0%")).toBeTruthy();
    await waitFor(() => expect(container.firstElementChild?.getAttribute("data-current-value")).toBe("30"));
  });
});

describe("segmented-progress-bar", () => {
  const cellsOf = (container: HTMLElement) =>
    Array.from(container.querySelectorAll<HTMLElement>('[data-slot="segmented-progress-cell"]'));

  it("renders uniform cells with the right fill count", () => {
    const { container } = render(<SegmentedProgressBar value={50} segments={10} label="usage" />);
    const cells = cellsOf(container);
    expect(cells).toHaveLength(10);
    /* Same box for both states: the border is always present (transparent when
     * empty), which is the fix for the uneven rhythm the owner saw. */
    for (const cell of cells) {
      expect(cell.className).toContain("min-w-0");
      expect(cell.className).toContain("rounded-sm");
      expect(cell.className).toContain("border");
    }
    expect(cells.slice(0, 5).every((cell) => cell.className.includes("bg-primary"))).toBe(true);
    expect(cells.slice(5).every((cell) => cell.className.includes("border-transparent"))).toBe(true);
    expect(cells.slice(5).every((cell) => cell.className.includes("bg-muted-foreground/70"))).toBe(true);
  });

  it("clamps the value and exposes it through aria", () => {
    const { container } = render(<SegmentedProgressBar value={150} max={100} segments={10} label="usage" />);
    const bar = screen.getByRole("progressbar", { name: "usage" });
    expect(bar.getAttribute("aria-valuenow")).toBe("100");
    expect(bar.getAttribute("aria-valuemax")).toBe("100");
    expect(cellsOf(container).every((cell) => cell.className.includes("bg-primary"))).toBe(true);
  });
});

describe("expand-details", () => {
  it("starts open and collapses on click", async () => {
    render(<ExpandDetails />);
    const toggle = screen.getByRole("button", { name: "Details" });
    expect(toggle.getAttribute("aria-expanded")).toBe("true");
    expect(screen.getByText("GPT 5.5 Codex")).toBeTruthy();
    fireEvent.click(toggle);
    expect(toggle.getAttribute("aria-expanded")).toBe("false");
    /* The panel leaves through AnimatePresence (popLayout). */
    await waitFor(() => expect(screen.queryByText("GPT 5.5 Codex")).toBeNull());
  });

  it("renders custom items and honours defaultOpen={false}", async () => {
    render(
      <ExpandDetails
        title="Run"
        defaultOpen={false}
        items={[{ label: "Status", value: "Succeeded", wide: true }]}
      />,
    );
    const toggle = screen.getByRole("button", { name: "Run" });
    expect(toggle.getAttribute("aria-expanded")).toBe("false");
    expect(screen.queryByText("Succeeded")).toBeNull();
    fireEvent.click(toggle);
    expect(await screen.findByText("Succeeded")).toBeTruthy();
  });

  it("takes its corners from the theme (no hardcoded radius)", () => {
    const { container } = render(<ExpandDetails />);
    const card = container.firstElementChild as HTMLElement;
    /* `rounded-xl` resolves var(--radius-xl) from index.css; the animated
     * 20↔24 morph of the doc is gone (owner: just a size-changing div). */
    expect(card.className).toContain("rounded-xl");
    expect(card.style.borderRadius).toBe("");
  });
});

describe("subscription-calendar", () => {
  const days: SubscriptionDay[] = [
    { date: 29, isMuted: true },
    { date: 1 },
    { date: 2, indicators: [<span key="dot" data-testid="indicator-dot" />] },
    { date: 3 },
  ];

  const renderCalendar = (props: Partial<React.ComponentProps<typeof SubscriptionCalendar>> = {}) =>
    render(
      <SubscriptionCalendar
        month="February"
        year={2026}
        days={days}
        monthlyTotal={10}
        subscriptionsCount={9}
        newCount={3}
        {...props}
      />,
    );

  it("renders the month, the total, the grid and the indicators", () => {
    renderCalendar();
    expect(screen.getByText("February, 2026")).toBeTruthy();
    expect(screen.getByText("$10.00")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Day 1" })).toBeTruthy();
    expect(screen.getAllByTestId("indicator-dot")).toHaveLength(1);
  });

  it("navigates months through the callbacks", () => {
    const onPrevMonth = vi.fn();
    const onNextMonth = vi.fn();
    renderCalendar({ onPrevMonth, onNextMonth });
    fireEvent.click(screen.getByRole("button", { name: "Previous month" }));
    fireEvent.click(screen.getByRole("button", { name: "Next month" }));
    expect(onPrevMonth).toHaveBeenCalledTimes(1);
    expect(onNextMonth).toHaveBeenCalledTimes(1);
  });

  it("selects a day and reports it through aria-pressed", () => {
    const { container } = renderCalendar();
    const day = screen.getByRole("button", { name: "Day 2" });
    expect(day.getAttribute("aria-pressed")).toBe("false");
    fireEvent.click(day);
    expect(day.getAttribute("aria-pressed")).toBe("true");
    /* Selected day (owner: same 2px/90% spec, primary instead of accent):
     * the inherited white-on-lime number would fail in dark mode, so it takes
     * the dark content color. */
    const glow = container.querySelector('[data-slot="day-glow"]');
    expect(glow?.className).toContain("bg-primary/60");
    expect(glow?.className).toContain("border-primary");
    expect(glow?.className).toContain("border-2");
    expect(day.className).toContain("text-primary-foreground");
    fireEvent.click(screen.getByRole("button", { name: "Day 3" }));
    expect(day.getAttribute("aria-pressed")).toBe("false");
  });

  it("opens and closes the add, search and summary overlays", async () => {
    renderCalendar();

    fireEvent.click(screen.getByRole("button", { name: "Add subscription" }));
    expect(await screen.findByText("Quick Add Subscription")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    await waitFor(() => expect(screen.queryByText("Quick Add Subscription")).toBeNull());

    fireEvent.click(screen.getByRole("button", { name: "Search subscriptions" }));
    expect(await screen.findByText("Search Subscriptions")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    await waitFor(() => expect(screen.queryByText("Search Subscriptions")).toBeNull());

    fireEvent.click(screen.getByRole("button", { name: "Monthly summary" }));
    expect(await screen.findByText("Monthly Summary")).toBeTruthy();
    expect(screen.getByText("Total Spend")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    await waitFor(() => expect(screen.queryByText("Monthly Summary")).toBeNull());
  });
});

describe("custom-ui dialog", () => {
  it("opens from the trigger and closes via the close button", async () => {
    render(
      <CustomDialog>
        <CustomDialogTrigger>open custom</CustomDialogTrigger>
        <CustomDialogContent>
          <CustomDialogTitle>Composed dialog</CustomDialogTitle>
        </CustomDialogContent>
      </CustomDialog>,
    );
    fireEvent.click(screen.getByText("open custom"));
    expect(await screen.findByText("Composed dialog")).toBeTruthy();
    fireEvent.click(screen.getByText("Close"));
    await waitFor(() => expect(screen.queryByText("Composed dialog")).toBeNull());
  });

  it("hides the close button and still closes via DialogClose", async () => {
    render(
      <CustomDialog>
        <CustomDialogTrigger>open custom</CustomDialogTrigger>
        <CustomDialogContent showCloseButton={false}>
          <CustomDialogTitle>No X here</CustomDialogTitle>
          <CustomDialogClose>Dismiss</CustomDialogClose>
        </CustomDialogContent>
      </CustomDialog>,
    );
    fireEvent.click(screen.getByText("open custom"));
    expect(await screen.findByText("No X here")).toBeTruthy();
    expect(screen.queryByText("Close")).toBeNull();
    fireEvent.click(screen.getByText("Dismiss"));
    await waitFor(() => expect(screen.queryByText("No X here")).toBeNull());
  });
});

describe("toggle-group", () => {
  it("selects a single value", () => {
    const onChange = vi.fn();
    render(
      <ToggleGroup type="single" defaultValue="bold" onValueChange={onChange} aria-label="style">
        <ToggleGroupItem value="bold" aria-label="bold" />
        <ToggleGroupItem value="italic" aria-label="italic" />
      </ToggleGroup>,
    );
    expect(screen.getByRole("radio", { name: "bold" }).getAttribute("aria-checked")).toBe("true");
    fireEvent.click(screen.getByRole("radio", { name: "italic" }));
    expect(onChange).toHaveBeenCalledWith("italic");
  });

  it("accumulates multiple values", () => {
    const onChange = vi.fn();
    render(
      <ToggleGroup type="multiple" defaultValue={["bold"]} onValueChange={onChange} aria-label="style">
        <ToggleGroupItem value="bold" aria-label="bold" />
        <ToggleGroupItem value="italic" aria-label="italic" />
      </ToggleGroup>,
    );
    fireEvent.click(screen.getByRole("button", { name: "italic" }));
    expect(onChange).toHaveBeenCalledWith(["bold", "italic"]);
  });

  it("moves focus with the arrow keys", async () => {
    render(
      <ToggleGroup type="single" defaultValue="bold" aria-label="style">
        <ToggleGroupItem value="bold" aria-label="bold" />
        <ToggleGroupItem value="italic" aria-label="italic" />
      </ToggleGroup>,
    );
    const bold = screen.getByRole("radio", { name: "bold" });
    bold.focus();
    fireEvent.keyDown(document.activeElement ?? bold, { key: "ArrowRight" });
    await waitFor(() => expect(document.activeElement).toBe(screen.getByRole("radio", { name: "italic" })));
  });

  it("paints the sliding pill", async () => {
    const { container } = render(
      <ToggleGroup type="single" defaultValue="bold" aria-label="style">
        <ToggleGroupHighlight>
          <ToggleGroupHighlightItem value="bold">
            <ToggleGroupItem value="bold" aria-label="bold" />
          </ToggleGroupHighlightItem>
        </ToggleGroupHighlight>
      </ToggleGroup>,
    );
    await waitFor(() =>
      expect(container.querySelector('[data-slot="motion-highlight"]')).toBeTruthy(),
    );
  });

  it("carries no own hover fill — the Highlight paints selection (upstream demo)", () => {
    render(
      <ToggleGroup type="single" defaultValue="bold" aria-label="style">
        <ToggleGroupHighlight>
          <ToggleGroupHighlightItem value="bold">
            <ToggleGroupItem value="bold" aria-label="bold" />
          </ToggleGroupHighlightItem>
        </ToggleGroupHighlight>
      </ToggleGroup>,
    );
    const cls = screen.getByRole("radio", { name: "bold" }).className;
    expect(cls).not.toContain("hover:bg-accent");
    expect(cls).not.toContain("hover:text-accent-foreground");
  });

  it("paints one overlay per active item in multiple mode", async () => {
    const { container } = render(
      <ToggleGroup type="multiple" defaultValue={["bold"]} aria-label="style">
        <ToggleGroupHighlightItem value="bold" className="bg-accent rounded-md">
          <ToggleGroupItem value="bold" aria-label="bold" />
        </ToggleGroupHighlightItem>
        <ToggleGroupHighlightItem value="italic" className="bg-accent rounded-md">
          <ToggleGroupItem value="italic" aria-label="italic" />
        </ToggleGroupHighlightItem>
      </ToggleGroup>,
    );
    await waitFor(() => {
      const overlays = container.querySelectorAll(
        '[data-slot="toggle-group-highlight-item"].bg-accent',
      );
      expect(overlays.length).toBe(1);
    });
  });
});

describe("floating-input", () => {
  it("associates label and accepts text", () => {
    render(<FloatingInput label="Email Address" type="email" />);
    const input = screen.getByLabelText("Email Address");
    fireEvent.change(input, { target: { value: "a@b.c" } });
    expect((input as HTMLInputElement).value).toBe("a@b.c");
  });

  it("blends with the background (no fill patch under the label chip)", () => {
    render(<FloatingInput label="Email Address" type="email" />);
    const cls = screen.getByLabelText("Email Address").className;
    expect(cls).toContain("bg-transparent");
    expect(cls).not.toContain("bg-input");
  });

  it("opens floated when prefilled", () => {
    render(<FloatingInput label="Project name" defaultValue="Apollo" />);
    const label = document.querySelector("label")?.className ?? "";
    expect(label).toContain("-top-2.5");
  });

  it("notches the top edge instead of a label chip", () => {
    // Closed: no delay class missing — the mirror delay only applies when shut.
    const closed = render(<FloatingInput label="Project name" />);
    const closedNotch = closed.container.querySelector('[data-slot="input-notch"]') as HTMLElement;
    expect(closedNotch.style.width).toBe("0px");
    expect(closedNotch.className).toContain("delay-75");
    cleanup();

    const { container } = render(<FloatingInput label="Project name" defaultValue="Apollo" />);
    const notch = container.querySelector('[data-slot="input-notch"]');
    expect(notch).toBeTruthy();
    // Prefilled → floated → open notch (label width + 8 pad; jsdom
    // measures 0, so 8px; the w-2 leading stub centers the text: 4px each side).
    expect((notch as HTMLElement).style.width).toBe("8px");
    // Open: fast, no delay (ready before the 150ms label travel).
    expect((notch as HTMLElement).className).toContain("duration-100");
    expect((notch as HTMLElement).className).not.toContain("delay-75");
    // No background chip anywhere on the label.
    const label = container.querySelector("label")?.className ?? "";
    expect(label).not.toContain("bg-background");
    expect(label).toContain("motion-reduce:transition-none");
  });

  it("renders disabled and password variants", () => {
    render(
      <>
        <FloatingInput label="Disabled" disabled />
        <FloatingInput label="Password" type="password" />
      </>,
    );
    expect((screen.getByLabelText("Disabled") as HTMLInputElement).disabled).toBe(true);
    expect(screen.getByLabelText("Password").getAttribute("type")).toBe("password");
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

  it("fills from min on mount by default", () => {
    render(<CircularProgress value={25} />);
    // aria reflects the real value; the painted value starts at 0.
    expect(screen.getByRole("progressbar").getAttribute("data-current-value")).toBe("0");
  });

  it("animateOnMount={false} starts at the value", () => {
    render(<CircularProgress value={25} animateOnMount={false} />);
    expect(screen.getByRole("progressbar").getAttribute("data-current-value")).toBe("25");
  });

  it("reaches the value when the fill finishes", async () => {
    render(<CircularProgress value={40} transitionLength={30} />);
    await waitFor(() =>
      expect(screen.getByRole("progressbar").getAttribute("data-current-value")).toBe("40"),
    );
  });
});

describe("custom-ui checkbox", () => {
  it("toggles on click and renders the indicator", () => {
    render(<CustomCheckbox aria-label="demo" />);
    const box = () => screen.getByRole("checkbox");
    expect(box().getAttribute("aria-checked")).toBe("false");
    fireEvent.click(box());
    expect(box().getAttribute("aria-checked")).toBe("true");
    expect(document.querySelector('[data-slot="checkbox-indicator"]')).not.toBeNull();
  });

  it("exposes the mixed state when indeterminate", () => {
    render(<CustomCheckbox indeterminate aria-label="demo mixed" />);
    expect(screen.getByRole("checkbox").getAttribute("aria-checked")).toBe("mixed");
  });
});

describe("custom-ui switch", () => {
  it("toggles uncontrolled and reports the change", () => {
    const onChange = vi.fn();
    render(<CustomSwitch aria-label="auto" onCheckedChange={onChange} />);
    const sw = () => screen.getByRole("switch");
    expect(sw().getAttribute("aria-checked")).toBe("false");
    fireEvent.click(sw());
    expect(sw().getAttribute("aria-checked")).toBe("true");
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it("honours the controlled value", () => {
    render(<CustomSwitch aria-label="auto" checked onCheckedChange={() => {}} />);
    expect(screen.getByRole("switch").getAttribute("aria-checked")).toBe("true");
  });

  it("does not toggle while disabled", () => {
    render(<CustomSwitch aria-label="auto" disabled />);
    fireEvent.click(screen.getByRole("switch"));
    expect(screen.getByRole("switch").getAttribute("aria-checked")).toBe("false");
  });
});

describe("theme-toggle", () => {  it("flips the dark class", async () => {
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

describe("avatar-group", () => {
  const users = [
    { name: "Ada Lovelace", presence: "online" },
    { name: "Alan Turing", presence: "online" },
    { name: "Grace Hopper", presence: "offline" },
  ] as const;

  it("overflows with +N and announces online count", () => {
    render(<AvatarGroup users={[...users]} max={2} />);
    expect(screen.getByText("+1")).toBeTruthy();
    expect(screen.getByRole("group", { name: "2 online" })).toBeTruthy();
  });

  it("renders one tooltip per avatar with the name only", async () => {
    render(<AvatarGroup users={[...users]} max={3} />);
    const group = screen.getByRole("group", { name: "2 online" });
    // One trigger per avatar (the Slot merges onto the motion container).
    expect(group.querySelectorAll('[data-slot="tooltip-trigger"]').length).toBe(3);
    // No presence suffix without showPresence.
    expect(screen.getByLabelText("Ada Lovelace")).toBeTruthy();
  });

  it("hides the counter when everyone fits", () => {
    render(<AvatarGroup users={[...users]} max={4} />);
    expect(screen.queryByText(/^\+\d+$/)).toBeNull();
  });

  it("reveals the sidebar-style name tooltip on hover", async () => {
    render(<AvatarGroup users={[{ name: "Ada Lovelace", presence: "online" }]} />);
    fireEvent.mouseEnter(screen.getByLabelText("Ada Lovelace"));
    expect(await screen.findByText("Ada Lovelace")).toBeTruthy();
  });

  it("single renders a bare avatar with optional tooltip", async () => {
    const { rerender } = render(
      <AvatarGroup mode="single" user={{ name: "Ada Lovelace", presence: "online" }} />,
    );
    expect(screen.getByLabelText("Ada Lovelace")).toBeTruthy();
    fireEvent.mouseEnter(screen.getByLabelText("Ada Lovelace"));
    expect(await screen.findByText("Ada Lovelace")).toBeTruthy();

    rerender(<AvatarGroup mode="single" tooltip={false} user={{ name: "Ada Lovelace" }} />);
    expect(screen.getByLabelText("Ada Lovelace")).toBeTruthy();
    expect(document.querySelector('[data-slot="tooltip-trigger"]')).toBeNull();
  });

  it("shows presence only with showPresence, in the three token states", () => {
    const trio = [
      { name: "Ada Lovelace", presence: "online" },
      { name: "Grace Hopper", presence: "offline" },
      { name: "Alan Turing", presence: "inactive" },
    ] as const;
    const { container, rerender } = render(<AvatarGroup users={[...trio]} max={3} />);
    expect(container.querySelector('[class*="bg-chart-2"]')).toBeNull();

    rerender(<AvatarGroup users={[...trio]} max={3} showPresence />);
    expect(screen.getByLabelText("Ada Lovelace (online)")).toBeTruthy();
    expect(screen.getByLabelText("Grace Hopper (offline)")).toBeTruthy();
    expect(screen.getByLabelText("Alan Turing (inactive)")).toBeTruthy();
    // Solid status border + 60% blurred fill (owner standard).
    expect(container.querySelector('[class*="border-chart-2"]')).toBeTruthy();
    expect(container.querySelector('[class*="border-destructive"]')).toBeTruthy();
    expect(container.querySelector('[class*="bg-muted/60"]')).toBeTruthy();
    expect(container.querySelector(".backdrop-blur-sm")).toBeTruthy();
  });
});

describe("files", () => {
  it("expands folders and renders git states", async () => {
    render(
      <Files>
        <FolderItem value="src">
          <FolderTrigger>src</FolderTrigger>
          <FolderPanel>
            <SubFiles>
              <FileItem gitStatus="modified">app-sidebar.tsx</FileItem>
              <FileItem>icons.tsx</FileItem>
            </SubFiles>
          </FolderPanel>
        </FolderItem>
      </Files>,
    );
    /* Collapsed by default: the nested file is absent. */
    expect(screen.queryByText("app-sidebar.tsx")).toBeNull();
    fireEvent.click(screen.getByText("src"));
    expect(await screen.findByText("app-sidebar.tsx")).toBeTruthy();
    /* Git states render as letters with the theme tokens. */
    expect(screen.getByText("M")).toBeTruthy();
    fireEvent.click(screen.getByText("src"));
    await waitFor(() => expect(screen.queryByText("app-sidebar.tsx")).toBeNull());
  });
});

describe("tabs", () => {
  const renderTabs = (mode?: "auto-height" | "layout") => {
    const panels =
      mode === "layout" ? (
        <TabsPanels mode="layout">
          <TabsPanel value="a">panel-a</TabsPanel>
          <TabsPanel value="b">panel-b</TabsPanel>
        </TabsPanels>
      ) : (
        <TabsPanels>
          <TabsPanel value="a">panel-a</TabsPanel>
          <TabsPanel value="b">panel-b</TabsPanel>
        </TabsPanels>
      );
    render(
      <Tabs defaultValue="a" aria-label="demo">
        <TabsHighlight>
          <TabsList>
            <TabsHighlightItem value="a">
              <TabsTab value="a">Alpha</TabsTab>
            </TabsHighlightItem>
            <TabsHighlightItem value="b">
              <TabsTab value="b">Beta</TabsTab>
            </TabsHighlightItem>
          </TabsList>
        </TabsHighlight>
        {panels}
      </Tabs>,
    );
  };

  it.each(["auto-height", "layout"] as const)("switches panels in %s mode", (mode) => {
    renderTabs(mode);
    expect(screen.getByText("panel-a")).toBeTruthy();
    fireEvent.click(screen.getByRole("tab", { name: "Beta" }));
    expect(screen.getByText("panel-b")).toBeTruthy();
  });

  it("moves focus with the arrow keys", async () => {
    renderTabs();
    screen.getByRole("tab", { name: "Alpha" }).focus();
    fireEvent.keyDown(document.activeElement ?? document.body, { key: "ArrowRight" });
    await waitFor(() => expect(document.activeElement).toBe(screen.getByRole("tab", { name: "Beta" })));
  });

  it("paints the sliding pill", async () => {
    const { container } = render(
      <Tabs defaultValue="a" aria-label="demo">
        <TabsHighlight>
          <TabsList>
            <TabsHighlightItem value="a">
              <TabsTab value="a">Alpha</TabsTab>
            </TabsHighlightItem>
          </TabsList>
        </TabsHighlight>
        <TabsPanels>
          <TabsPanel value="a">panel-a</TabsPanel>
        </TabsPanels>
      </Tabs>,
    );
    await waitFor(() =>
      expect(container.querySelector('[data-slot="motion-highlight"]')).toBeTruthy(),
    );
  });

  it("carries no own hover fill — the Highlight paints selection (upstream demo)", () => {
    renderTabs();
    const cls = screen.getByRole("tab", { name: "Alpha" }).className;
    expect(cls).not.toContain("hover:");
    // Bare `data-[disabled]` matches `data-disabled="false"` too (attribute
    // presence) — Base UI always renders the attr, so it would kill clicks
    // and fade every tab. Native `:disabled` only (regression 2026-09-30).
    expect(cls).not.toContain("data-[disabled]:pointer-events-none");
    expect(cls).toContain("disabled:pointer-events-none");
  });
});

describe("checkbox variants", () => {
  it("applies accent + lg classes", () => {
    render(<Checkbox variant="accent" size="lg" aria-label="big accent" />);
    const box = screen.getByRole("checkbox");
    expect(box.className).toContain("h-5");
    expect(box.className).toContain("data-[checked]:bg-accent");
  });
});

describe("copy-button controlled", () => {
  it("honours controlled copied + custom press scale", async () => {
    const writeText = vi.fn(async () => {});
    vi.stubGlobal("navigator", { clipboard: { writeText } });
    render(<CopyButton content="x" copied tapScale={0.9} delay={20} />);
    expect(await screen.findByRole("button", { name: /copied/i })).toBeTruthy();
  });
});

describe("toggle-group icons", () => {
  it("renders icon toggles sharing state", () => {
    const onChange = vi.fn();
    render(
      <ToggleGroup type="single" defaultValue="bold" onValueChange={onChange} aria-label="fmt">
        <ToggleGroupItem value="bold" aria-label="fmt-bold" />
        <ToggleGroupItem value="italic" aria-label="fmt-italic" />
      </ToggleGroup>,
    );
    fireEvent.click(screen.getByRole("radio", { name: "fmt-italic" }));
    expect(onChange).toHaveBeenCalledWith("italic");
  });
});

describe("dropdown-menu", () => {
  // Radix opens on the pointer sequence (real browsers send it natively).
  const openMenu = (trigger: HTMLElement) => {
    fireEvent.pointerDown(trigger, { pointerType: "mouse", button: 0 });
    fireEvent.mouseDown(trigger, { button: 0 });
    fireEvent.click(trigger);
  };

  it("opens on trigger and closes on Escape", async () => {
    const onSelect = vi.fn();
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Actions</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onSelect={onSelect}>View</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    openMenu(screen.getByRole("button", { name: "Actions" }));
    expect(await screen.findByRole("menuitem", { name: "View" })).toBeTruthy();
    fireEvent.keyDown(screen.getByRole("menuitem", { name: "View" }), { key: "Escape" });
    await waitFor(() => expect(screen.queryByRole("menuitem", { name: "View" })).toBeNull());
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("selects an item on click", async () => {
    const onSelect = vi.fn();
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Actions</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onSelect={onSelect}>View</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    openMenu(screen.getByRole("button", { name: "Actions" }));
    fireEvent.click(await screen.findByRole("menuitem", { name: "View" }));
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it("opens a sub-menu and selects the nested item", async () => {
    const onSelect = vi.fn();
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Actions</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Invite</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem onSelect={onSelect}>Email</DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    openMenu(screen.getByRole("button", { name: "Actions" }));
    const subTrigger = await screen.findByRole("menuitem", { name: "Invite" });
    /* Keyboard is the deterministic path in jsdom (hover needs real pointer
     * movement). */
    fireEvent.keyDown(subTrigger, { key: "ArrowRight" });
    fireEvent.click(await screen.findByRole("menuitem", { name: "Email" }));
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it("toggles a checkbox item", async () => {
    const onCheckedChange = vi.fn();
    render(
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger>Prefs</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuCheckboxItem checked={false} onCheckedChange={onCheckedChange}>
            Compact
          </DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    openMenu(screen.getByRole("button", { name: "Prefs" }));
    fireEvent.click(await screen.findByRole("menuitemcheckbox", { name: "Compact" }));
    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });

  it("picks a radio item from the group", async () => {
    const onValueChange = vi.fn();
    render(
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger>Prefs</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuRadioGroup value="comfortable" onValueChange={onValueChange}>
            <DropdownMenuRadioItem value="comfortable">Comfortable</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="dense">Dense</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    openMenu(screen.getByRole("button", { name: "Prefs" }));
    fireEvent.click(await screen.findByRole("menuitemradio", { name: "Dense" }));
    expect(onValueChange).toHaveBeenCalledWith("dense");
  });
});

describe("collapsible", () => {
  it("toggles its panel", async () => {
    render(
      <Collapsible>
        <CollapsibleTrigger>Section</CollapsibleTrigger>
        <CollapsibleContent>panel body</CollapsibleContent>
      </Collapsible>,
    );
    expect(screen.queryByText("panel body")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Section" }));
    expect(await screen.findByText("panel body")).toBeTruthy();
  });
});

describe("breadcrumb", () => {
  it("renders trail with current page", () => {
    render(
      <MemoryRouter>
        <Breadcrumb trail={[{ label: "Admin", to: "/admin" }, { label: "Users" }]} />
      </MemoryRouter>,
    );
    expect(screen.getByRole("navigation", { name: "Breadcrumb" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "Admin" })).toBeTruthy();
    expect(screen.getByText("Users")).toBeTruthy();
  });
});

describe("separator", () => {
  it("renders horizontal rule by default", () => {
    const { container } = render(<Separator />);
    const rule = container.querySelector('[role="separator"]');
    expect(rule?.getAttribute("aria-orientation")).toBe("horizontal");
  });
});

describe("avatar image", () => {
  it("falls back to initials without src", () => {
    render(<Avatar name="Ada Lovelace" />);
    expect(screen.getByText("AL")).toBeTruthy();
  });
});
