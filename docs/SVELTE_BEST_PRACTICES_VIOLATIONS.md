# Svelte Best Practices Violations Report

**Generated:** March 19, 2025  
**Svelte Version:** 5.54.0  
**Analysis Tool:** Svelte MCP svelte-autofixer

This document catalogs violations of Svelte 5 best practices found in the dollar-holler project. Use it as a baseline to track improvement over time—re-run the Svelte MCP autofixer periodically and compare results.

---

## Summary

| Category                                     | Count |
| -------------------------------------------- | ----- |
| **Issues** (errors / compiler warnings)      | 0     |
| **Suggestions** (best practice improvements) | 15+   |
| **Files with violations**                    | 1     |
| **Files analyzed**                           | 20+   |

---

## Issues (Errors / Compiler Warnings)

These are actual problems that can cause incorrect behavior or trigger Svelte compiler warnings.

### 1. `InvoiceRow.svelte` — `state_referenced_locally` — **FIXED**

**Status:** Resolved by wrapping `INVOICE_OPTIONS` in `$derived` so it updates when `isOptionsDisabled` changes. Svelte autofixer reports no issues.

~~**Fix:** Use `$derived` for the options array so it updates when `isOptionsDisabled` changes:~~

```svelte
const INVOICE_OPTIONS = $derived([
  {
    label: "Edit",
    icon: Edit,
    onclick: handleEdit,
    disabled: isOptionsDisabled,
  },
  // ... rest of options
] satisfies Option[]);
```

---

### 2. `ClientRow.svelte` — `state_referenced_locally` — **FIXED**

**Status:** Resolved by wrapping `CLIENT_OPTIONS` in `$derived` so it updates when `client` changes. Svelte autofixer reports no issues.

~~**Fix:** Use `$derived` for the options array:~~

```svelte
const CLIENT_OPTIONS = $derived([
  {
    label: "Edit",
    icon: Edit,
    onclick: handleEdit,
    disabled: false,
  },
  // ...
  {
    label: "Active",
    icon: Activate,
    onclick: handleActivation,
    disabled: client.clientStatus === "active",
  },
  {
    label: "Archive",
    icon: Archive,
    onclick: handleArchive,
    disabled: client.clientStatus === "archive",
  },
] satisfies Option[]);
```

---

## Suggestions (Best Practice Improvements)

These are recommendations from the Svelte autofixer. Some may be intentional; use judgment when applying.

### 3. `InvoiceForm.svelte` — `$effect` malpractice — **FIXED**

**Category:** Reactivity / `$effect` usage

**Status:** Resolved by refactoring to use `onMount`/`onDestroy` lifecycle methods instead of `$effect`. The refactor also added: a keyed block `{#key editPanel.item.id}` in the parent so each invoice edit gets a fresh component instance; `AbortController` with Eden Treaty's `fetch` option to cancel in-flight line-item fetches when the component unmounts; an `isMounted` flag to avoid updating state after unmount when the user closes the panel before the load completes.

---

### 4. `swipe.svelte.ts` — Functions called inside `$effect`

**Category:** `$effect` usage in attachments

**Suggestions:**

- `transformElement` called inside `$effect` — The autofixer suggests checking if it reassigns state. Here it only mutates the DOM; this is a valid side effect.
- `reset` and `onResetComplete` called inside `$effect` — Used for reset-on-trigger behavior; appropriate for `$effect`.
- `on`, `offMouse`, `offTouch` — Event listener setup/teardown in `$effect` is the correct pattern for Svelte 5 attachments.

**What the Svelte docs say:** The docs explicitly list DOM manipulation as an intended use of `$effect` (e.g. drawing on canvas, calling third-party libraries). The malpractice is **updating state** inside effects, not calling functions that perform side effects like DOM updates.

**Alternatives from the docs:** When effects are not ideal: `{@attach ...}` for external libs; event handlers/function bindings for user interaction; `$derived` for computed values; `createSubscriber` for external systems.

**Context:** These are intentional side effects (DOM updates, event listeners). The autofixer’s generic suggestions don’t fully apply; the current usage is reasonable. The comment in the file about stable callback references is good practice.

---

## Files With No Violations

The following files passed the autofixer with no issues or suggestions:

- `AdditionalOptions.svelte`
- `InvoiceForm.svelte`
- `InvoiceRow.svelte`
- `ClientRow.svelte`
- `invoices/+page.svelte`
- `clients/+page.svelte`
- `Modal.svelte`
- `SlidePanel.svelte`
- `Swipeable.svelte`
- `ConfirmDelete.svelte`
- `Search.svelte`
- `Navbar.svelte`
- `Alert.svelte`
- `ItemPanel.svelte.ts`
- `Toggle.svelte.ts`
- `BlankState.svelte`
- `NoSearchResults.svelte`
- `button.svelte` (UI)

---

## Recommendations

1. **Re-run periodically** — Use the Svelte MCP `svelte-autofixer` on changed files to track progress and catch regressions.

---

## How to Re-run Analysis

Use the Svelte MCP server’s `svelte-autofixer` tool with:

- `code`: Full component/module source
- `desired_svelte_version`: 5
- `filename`: Component name (e.g. `InvoiceRow.svelte`)

Or run it via Cursor’s Svelte integration when editing Svelte files.
