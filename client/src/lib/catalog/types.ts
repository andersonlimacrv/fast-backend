/* Catalog types: the single taxonomy shared by /admin/lab and /admin/gallery.
 * Numbering (`n`) is stable and immutable — new entries are appended, never
 * renumbered, so Lab ↔ Gallery always talk about the same item by the same
 * number. Entries are seeded from `references/components_to_use/` (the source
 * docs) and grow as new reference docs land. */

/** Shape of the item: atom vs composed section. */
export type CatalogClass = "component" | "block";

/** Adoption state, flipped 1-by-1 by the owner. "stamped" is retired. */
export type CatalogStatus = "pending" | "validated" | "dropped";

/** Domain type (classification, orthogonal to `class`). */
export type CatalogKind = "base" | "buttons" | "data" | "media" | "shell" | "identity" | "feedback";

/** Origin folder inside `references/components_to_use/`. */
export type RefGroup = "animate-ui" | "exemple-layours" | "standalone";

/** Where the item is used for real (the identification the owner asked for). */
export interface CatalogUsage {
  /** Human label of the page/surface ("Projects", "Sidebar shell"). */
  label: string;
  /** App route for a quick link; absent = text-only description. */
  to?: string;
  /** "app" = page outside /admin, "admin" = /admin page, "shell" = app frame. */
  scope: "app" | "admin" | "shell";
}

export interface CatalogEntry {
  /** Stable enumeration (01..N), never reused nor renumbered. */
  n: number;
  /** Stable id (file/demo registry key). */
  slug: string;
  /** Canonical display name (matches the reference doc). */
  name: string;
  class: CatalogClass;
  kind: CatalogKind;
  status: CatalogStatus;
  /** Source doc under `references/components_to_use/`. */
  ref: string;
  refGroup: RefGroup;
  /** Implementation file (or null while not ported). */
  source: string | null;
  /** Real usage sites; empty while nothing consumes it. */
  usedIn: CatalogUsage[];
  /** Short decision/context note (non-port, drop, trade-off). */
  note?: string;
}
