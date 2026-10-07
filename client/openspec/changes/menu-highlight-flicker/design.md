# menu-highlight-flicker — design

## Context

Owner-reported blink in dropdown menus (org switcher, Projects actions, user menu), in the shell and the lab proof. Nav never blinks.

## Decisions

1. **Root cause, measured**: per-item pills (`mode="children"` + shared `layoutId`) with `AnimatePresence` exit delayed 200ms (upstream default, never overridden in `DropdownMenuHighlight`). Hover A→B: old pill fully opaque for 200ms while the new fades in — 2–4 simultaneous pills/item in 12/12 samples. Parent-mode nav has a single pill, hence no blink.
2. **Fix in two layers** (both local deltas, documented in code): (a) `exitDelay={0}` default on `DropdownMenuHighlight` — old pill starts leaving at once; (b) instant `{duration: 0}` exit when the effective delay is 0, so the `layoutId` handoff pairs cleanly. Other consumers (tabs, toggle-group, files) keep their fade — opt-in only.
3. **No test in jsdom**: animation timing isn't measurable there (established rationale); evidence is the browser measurement + screenshot. Existing catalog/sidebar suites guard regressions structurally.
4. **Upstream parity**: vendored files match current upstream; the deltas are ours and marked as such.
