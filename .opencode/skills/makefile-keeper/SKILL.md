---
name: makefile-keeper
description: Maintain this repo's root Makefile to standard. Use when adding, renaming, or removing make targets, changing sections or variables, fixing make help output, debugging missing-separator/.PHONY/variable-expansion issues, or when docs drift from the Makefile.
license: MIT
---

# Makefile Keeper (fast-backend)

Keep the root `Makefile` the single entry point for every repo command: a
scannable menu, not a build system. Logic lives in `scripts/`; the Makefile
only orchestrates. Base references (read for depth, don't duplicate):
`cmd-makefile` (phased flow, env bootstrap, dry-run verification),
`writing-makefiles` (help pattern, pitfalls table, "test the dispatcher" rule).

## When to use

- New repo command → new target (or extend an existing one).
- Rename/remove/retire a target (check dependents first — see workflow).
- `make help` looks wrong, a guard misfires, docs disagree with behavior.
- Reviewing someone else's Makefile edit.

## Repo conventions (enforced)

### 1. File skeleton (in this order)

Safety headers → fork-points comment → `?=` variables → `##@` sections with
targets → `help`/`help-unclassified` → `.PHONY` groups. Reference
`references/Makefile` only for ideas (different stack, poetry-based, no help
target) — never copy recipes verbatim.

```makefile
SHELL := bash
.SHELLFLAGS := -eu -o pipefail -c
.DELETE_ON_ERROR:
.DEFAULT_GOAL := help
```

### 2. Help-first documentation

- Every public target: one-line `##` (what it affects + inline example, e.g.
  `## Roll back one migration (make downgrade / make downgrade rev=base)`).
- Sections via `##@` emoji headers (`🚀 Setup`, `🗄️ Database`, `🧪 Tests`,
  `🛠️ Verify`, `🐳 Docker`, `🏃 Run`, `🛫 Ops`, `📦 Meta`, `❓ Help`).
- Emoji on section headers only, never on target lines (column alignment).
- `help-unclassified` must always print nothing — it audits missing sections.

### 3. Naming

Kebab-case, action-first (`db-migrate`, not `migrate-db`); `_`-prefixed
internals with no `##` (`_check-env`); required args as `UPPER=VISIBLE`
(`msg=`, `f=`, `FILE=`, `CONFIRM=`) with a `Usage:` guard that names them.

### 4. Variables (fork points)

`?=` overridables at top (`UV`, `COMPOSE`, `ENV_FILE`, `HOST`, `PORT`,
`WORKERS`, `STACK_SERVICES`, `BUILD_TARGET`, `IMAGE`, `TAG`, `BACKUP_DIR`).
Recipes use `$(VAR)`; shell vars as `$$VAR`; literal TABs in recipes
(spaces → `missing separator`). Secrets/URLs come from the environment,
never from variables or files the Makefile writes.

### 5. `.PHONY`

Every non-file target, grouped per section at the bottom. A missing entry
fails silently the day a same-named file appears (`make: 'clean' is up to
date` with nothing done).

### 6. Destructive targets

`db-reset`, `restore`, anything dropping data or touching prod: require
`CONFIRM=1`, carry `(⚠️ DESTRUCTIVE)` in the help line, never default to
yes, never run in CI. Complete list lives in `docs/Makefile.md`.

### 7. Thin recipes

>5 lines, `if/else` beyond guards, or loops → move to `scripts/` and call it.
Usage guards print `Usage:` + `exit 1`. Env preconditions (`_check-env`)
fail fast naming the fix (`make env-template`).

### 8. Single source of truth

CI (`.github/workflows/ci.yml`) calls the **same** targets devs run — never
duplicate commands in CI config. Drift either way is a bug.

## Workflow

1. Read `Makefile` + `docs/Makefile.md` (+ `.pt-BR.md`) before changing.
2. Check dependents: `rg "make <old-name>"` across repo + workflows before
   renaming; never remove a target without explicit approval.
3. Apply the edit (tabs, `.PHONY`, `##`, section placement).
4. Verify: `make help` renders in the right section; `make help-unclassified`
   empty; `make -n <target>` prints sane commands; guards fire when misused
   (`make migration`, `make db-reset`, `make restore` without args).
5. Sync docs: behavior change → `docs/Makefile.md` **and** `.pt-BR.md`
   (full translation, never half); new command family → README lists;
   new variable → variables table in both docs.
6. Run gates (`ruff`, `mypy`, `lint-imports`, affected `pytest`) — a Makefile
   edit must never break them.

## Pitfalls (fast diagnosis)

| Symptom | Cause | Fix |
|---|---|---|
| `missing separator. Stop.` | spaces, not TABs | re-indent with literal tabs |
| `make: 'x' is up to date` | missing `.PHONY` | add to the section group |
| Empty `$VAR` in recipe | `$V` parsed as make var | escape shell vars as `$$VAR` |
| Command echoed noisily | missing `@` | prefix expected lines with `@` |
| Wrong DB hit silently | exported shell `DATABASE_URL` won | recipes read env via app/settings, never rewrite `.env` |
| Help row misaligned | emoji on target line | emoji on `##@` headers only |
| `verify` says nothing to do | target with only prerequisites | normal — prereqs ran; add recipe if output needed |

## Red flags (stop and fix)

- Target without `##`; section without `##@`; missing `.PHONY` entry.
- Destructive target without `CONFIRM` or without ⚠️.
- Logic duplicated between Makefile and CI workflow.
- `sudo`, hardcoded credentials/secrets, or rewriting `.env` from a recipe.
- `:latest` image tags anywhere near `build`/deploy.
- Renaming a target CI/scripts/docs reference without updating all three.

## Verification

- [ ] `make help` clean + categorized, `make help-unclassified` empty
- [ ] `make -n` on touched targets prints sane commands
- [ ] Guards fail loudly when misused (missing args, missing `.env`, missing `CONFIRM`)
- [ ] `docs/Makefile.md` + `.pt-BR.md` match behavior; README lists if user-facing
- [ ] Full gates green (`ruff`, `mypy`, `lint-imports`, `pytest`)
- [ ] `git status` shows only intended files
