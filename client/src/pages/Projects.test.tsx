// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";

import { NewProjectPage } from "@/pages/Projects";

vi.mock("@/services/projects", () => ({
  createNewProject: vi.fn(async (name: string) => ({ id: "p9", org_id: "o1", name })),
  removeProject: vi.fn(async () => {}),
  renameExistingProject: vi.fn(async (id: string, name: string) => ({ id, org_id: "o1", name })),
}));

vi.mock("@/services/notify", () => ({
  notify: { success: vi.fn(), confirm: vi.fn(), error: vi.fn(), info: vi.fn(), warning: vi.fn() },
}));

import { createNewProject } from "@/services/projects";

function renderNewProjectPage() {
  render(
    <MemoryRouter initialEntries={["/projects/new"]}>
      <Routes>
        <Route path="/projects/new" element={<NewProjectPage />} />
        <Route path="/projects" element={<p>projects list</p>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("new project page", () => {
  afterEach(() => cleanup());

  it("creates the project and navigates back to the list", async () => {
    renderNewProjectPage();
    fireEvent.change(screen.getByLabelText(/project name/i), { target: { value: "Apollo" } });
    fireEvent.click(screen.getByRole("button", { name: /create project/i }));
    expect(createNewProject).toHaveBeenCalledWith("Apollo");
    expect(await screen.findByText("projects list")).toBeTruthy();
  });

  it("ignores names shorter than 2 chars", async () => {
    renderNewProjectPage();
    fireEvent.change(screen.getByLabelText(/project name/i), { target: { value: "x" } });
    fireEvent.click(screen.getByRole("button", { name: /create project/i }));
    expect(createNewProject).not.toHaveBeenCalled();
    expect(screen.queryByText("projects list")).toBeNull();
  });
});
