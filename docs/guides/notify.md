# Notify guide — push vs blocks (EN)

> 🇬🇧 English | [Português (BR)](notify.pt-BR.md)
>
> Contract: `client/src/services/notify.ts`. Provider: `services/notify.provider.ts`
> (`goey-toast` behind it). Mount: `AppToaster` in `App.tsx` (once).
> Change: `client/openspec/changes/notify-standard/`. Rule location:
> `docs/CLIENT-STRUCTURE.md` ("Notificações").

## 1. The split (decide first, code second)

| Signal | Channel | API |
|---|---|---|
| Mutation result (created/updated/deleted/switched) | **Push** (transient, global) | `notify.success/info/warning/error` |
| Async task with phases | **Push lifecycle** | `notify.promise` |
| Global/session event (expiry, reconnect) | **Push** | `notify.*` from services |
| Load/query failure, stays until fixed | **Block** | `ErrorBox` (+ retry) |
| Empty list, nothing yet | **Block** | `EmptyState` |
| Route-level failure (403/404/500 page) | **Block** | `ErrorOne` |
| Blocking choice (destructive/irreversible) | **Block** | `AlertDialog` |
| Form field validation | **Inline** (never push, never block) | field error text |

Same failure in both channels is a bug. `friendlyError` is the single
language shared by `notify.fromError` and `ErrorBox` — never hand-write a
second copy of status→text mapping.

## 2. Push contract (the only import pages need)

```ts
import { notify } from "@/services/notify"; // or useNotify() inside React

notify.success("Project created", created.name);
notify.error("Save failed", detail);       // 7s persistence, others 5s
notify.fromError(err);                     // ApiError → friendly title+detail
notify.promise(saveTask, {
  loading: "Saving",
  success: "Saved",                        // string | (data) => string
  error: "Save failed",                    // string | (err) => string
  description: { success: <Text/>, error: (err) => <Text/> }, // optional
});
notify.close(id);
```

Types: `ToastKind`, `NotifyInput`, `NotifyPromiseLabels` — all from
`services/notify`. `notify.promise` returns the original promise (awaitable);
a string `error` title keeps the rejection detail mapped through
`friendlyError` as the body.

## 3. Site variations (goey-toast) — what is exposed, what is owned

The mount owns: `position` (bottom-right), `theme` (reactive `.dark`),
`spring` (off under reduced-motion), `maxQueue={3}`. The provider owns:
kind icons (`lib/icons`), durations (5s/7s). **Do not set these per-call.**
Kept site defaults: spring/bounce, Escape, swipe, timestamp, gap/offset.

Available through the contract today: `description` (string — plain text;
need a ReactNode body or an action button? extend the contract first in a
new change, never import `goey-toast`/`sonner` in a page), `duration` via
`timeout` override (justify non-default values), `notify.promise` lifecycle.
Available but unexposed: `update`, per-toast `classNames`/`fillColor`
(tokens only, owner reason required), `preset`, `showProgress`. Ask before
adding surface — each addition is contract + tests + docs.

## 4. Blocks — where and how

- Page-specific block → `pages/{page}/blocks/` (e.g.
  `pages/admin/blocks/UserError.tsx`). Nothing shared lives under `pages/`.
- Shared primitives only → `components/feedback.tsx` (`ErrorBox` with
  `actionLabel`/`onAction` retry), `components/error-state.tsx`
  (`EmptyState`, `ErrorOne`), `components/custom-ui/components/alert-dialog.tsx`.
- `ErrorBox` takes the raw `error` object (it runs `friendlyError` itself).

## 5. Forbidden

- Importing `goey-toast`, `sonner`, `framer-motion`, or
  `services/notify.provider` in pages/hooks/services (contract only).
- A second mount point (single `AppToaster`), a second error language,
  toast-with-action (retired `confirm` — blocking choice is `AlertDialog`).
- Push for validation or load failures; block + push for the same failure.
- Colors outside tokens, custom fonts, new shadows on toast visuals.

## 6. Tests & verification

- Page tests mock `@/services/notify` (the contract — see
  `Projects.test.tsx`); provider mapping is covered in `notify.test.ts`
  (kinds, durations, promise, mount props, live region).
- Gates: `tsc -b`, `oxlint`, vitest, `vite build`; eyeball both themes +
  reduced-motion for any visual change to push or blocks.
