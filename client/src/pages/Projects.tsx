import { useCallback, useEffect, useState } from "react";

import { useAuth } from "@/auth/AuthContext";
import { ErrorBox, Field, PageHeader } from "@/components/feedback";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { createProject, deleteProject, listProjects, renameProject } from "@/lib/api";
import type { ProjectRead } from "@/lib/api";

export function ProjectsPage() {
  const { activeOrgId } = useAuth();
  const [projects, setProjects] = useState<ProjectRead[]>([]);
  const [name, setName] = useState("");
  const [editing, setEditing] = useState<{ id: string; name: string } | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setProjects(await listProjects());
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load, activeOrgId]);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await createProject(name);
      setName("");
      await load();
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  };

  const saveRename = async () => {
    if (!editing) return;
    setError(null);
    try {
      await renameProject(editing.id, editing.name);
      setEditing(null);
      await load();
    } catch (err) {
      setError(err);
    }
  };

  const remove = async (id: string) => {
    setError(null);
    try {
      await deleteProject(id);
      await load();
    } catch (err) {
      setError(err);
    }
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
