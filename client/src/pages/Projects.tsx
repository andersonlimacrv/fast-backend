import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "@/contexts/AuthContext";
import { ErrorBox, Field, PageHeader } from "@/components/feedback";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useProjects } from "@/hooks/useProjects";
import { createNewProject, removeProject, renameExistingProject } from "@/services/projects";
import { notify } from "@/services/notify";
import { ROUTES } from "@/lib/constants";

/* Dedicated add-project page (Orgs aesthetic): name form only — the list,
 * rename and delete stay on the Projects management page. */
export function NewProjectPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<unknown>(null);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = name.trim();
    if (value.length < 2) return;
    setBusy(true);
    setError(null);
    try {
      const created = await createNewProject(value);
      notify.success("Project created", created.name);
      navigate(ROUTES.projects);
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="New project"
        description="Create a project inside the active organization."
      />
      <Card className="mb-4">
        <CardContent className="pt-6">
          <form onSubmit={(e) => void create(e)} className="flex flex-col gap-2 sm:flex-row sm:items-end">
            <div className="flex-1">
              <Field label="Project name (min 2)">
                <Input value={name} minLength={2} maxLength={120} required onChange={(e) => setName(e.target.value)} />
              </Field>
            </div>
            <Button type="submit" disabled={busy}>
              {busy ? "Creating…" : "Create project"}
            </Button>
          </form>
        </CardContent>
      </Card>
      <ErrorBox error={error} className="mb-4" />
    </div>
  );
}

export function ProjectsPage() {
  const { activeOrgId } = useAuth();
  const { items: projects, error, loading, busy, mutate } = useProjects(activeOrgId);
  const [name, setName] = useState("");
  const [editing, setEditing] = useState<{ id: string; name: string } | null>(null);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = name;
    const created = await mutate(() => createNewProject(value));
    if (created) {
      setName("");
      notify.success("Project created", value);
    }
  };

  const saveRename = async () => {
    if (!editing) return;
    const { id, name: newName } = editing;
    const saved = await mutate(() => renameExistingProject(id, newName));
    if (saved) {
      setEditing(null);
      notify.success("Project renamed", newName);
    }
  };

  const remove = async (id: string) => {
    const done = await mutate(() => removeProject(id));
    if (done !== null) notify.success("Project deleted");
  };

  return (
    <div>
      <PageHeader
        title="Projects"
        description="Tenant-scoped CRUD on /projects — delete requires admin; list/get gated by entitlement."
      />
      <Card className="mb-4">
        <CardContent className="pt-6">
          <form onSubmit={(e) => void create(e)} className="flex flex-col gap-2 sm:flex-row sm:items-end">
            <div className="flex-1">
              <Field label="New project name (min 2)">
                <Input value={name} minLength={2} maxLength={120} required onChange={(e) => setName(e.target.value)} />
              </Field>
            </div>
            <Button type="submit" disabled={busy}>
              {busy ? "Creating…" : "Create"}
            </Button>
          </form>
        </CardContent>
      </Card>
      <ErrorBox error={error} className="mb-4" />
      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Id</TableHead>
              <TableHead>Org</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-medium">
                  {editing?.id === p.id ? (
                    <Input value={editing.name} onChange={(e) => setEditing({ id: p.id, name: e.target.value })} />
                  ) : (
                    p.name
                  )}
                </TableCell>
                <TableCell className="max-w-40 truncate font-mono text-xs">{p.id}</TableCell>
                <TableCell className="max-w-40 truncate font-mono text-xs">{p.org_id}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {editing?.id === p.id ? (
                      <>
                        <Button size="sm" onClick={() => void saveRename()}>
                          Save
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setEditing(null)}>
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <Button size="sm" variant="outline" onClick={() => setEditing({ id: p.id, name: p.name })}>
                        Rename
                      </Button>
                    )}
                    <Button size="sm" variant="destructive" onClick={() => void remove(p.id)}>
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
