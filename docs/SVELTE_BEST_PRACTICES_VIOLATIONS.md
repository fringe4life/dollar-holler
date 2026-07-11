# Svelte Best Practices Violations Report

**Generated:** March 19, 2025  
**Last rechecked:** July 11, 2026  
**Svelte Version:** 5.56.4  
**Analysis Tool:** Svelte MCP `svelte-autofixer` + manual review against [Svelte best practices](https://svelte.dev/docs/svelte/best-practices)

This document catalogs violations of Svelte 5 best practices found in the dollar-holler project. Use it as a baseline to track improvement over time—re-run the Svelte MCP autofixer periodically and compare results.

---

## Summary (July 2026 recheck)

| Category                                           | Count   |
| -------------------------------------------------- | ------- |
| **Open issues** (incorrect rune usage / real bugs) | 0       |
| **Autofixer suggestions** (review / optional)      | ~8      |
| **Suppressed warnings** (`svelte-ignore`)          | 4 files |
| **Previously fixed**                               | 5       |
| **Files scanned this recheck**                     | ~38     |

**Verdict:** Layout `$derived` misuse fixed. Modal uses `dialogController` attach (no exposed `dialogEl`). Autofixer mostly clean outside `swipe.svelte.ts`. No legacy Svelte 4 patterns.

---

## Autofixer Suggestions (Review / Optional)

### 2. `swipe.svelte.ts` — Functions called inside `$effect`

**Category:** `$effect` usage in attachments  
**Status:** Intentional — keep

**Suggestions (8):** `transformElement`, `reset`, `onResetComplete`, `on`, `offMouse`, `offTouch` called inside `$effect`.

**Context:** DOM mutation + event listener setup/teardown. Docs list DOM / third-party side effects as intended `$effect` uses. Malpractice is **updating state** inside effects, not calling side-effect helpers.

**Alternatives if refactoring later:** `{@attach ...}` for element lifecycle; keep effects only where reactive deps must re-run.

---

## Suppressed Warnings (`svelte-ignore state_referenced_locally`)

These silence “state/prop read once at init” warnings. Intentional init-once patterns — document so they are not “fixed” blindly into `$derived` (which would re-init form/store state on every prop change).

| File | Pattern |
| --- | --- |
| `Search.svelte` | Seed `$state` search input from URL `q` once |
| `ClientForm.svelte` | Seed form `$state` from `edit` prop once |
| `EditInvoiceForm.svelte` | Seed invoice `$state` from `invoiceId` once |
| `clients/[id]/+page.svelte` | Construct / hydrate `ClientInvoicesStore` once from load data |

If prop changes must remount fresh state, prefer `{#key ...}` in parent over removing the ignore.

---

## Previously Fixed (still clean)

### 3. `Modal.svelte` / `ItemPanel` — `bind:this` + exposed `dialogEl` — **FIXED**

Uses `dialogController` attach (`src/lib/client/attachments/dialogController.ts`). Parents: `{@attach panel.attach}`. `ItemPanel` holds `{ show, close }` only. Autofixer: clean.

### 4. `invoices/[id]/+layout.svelte` — `$derived` for mutable callback state — **FIXED**

`previousPageLink` / `resolveNavigation` now `$state`. `getBackUrl` stays `$derived`. Autofixer: clean.

### 5. `InvoiceRow.svelte` — `state_referenced_locally` — **FIXED**

`INVOICE_OPTIONS` wrapped in `$derived`. Autofixer: clean.

### 6. `ClientRow.svelte` — `state_referenced_locally` — **FIXED**

`CLIENT_OPTIONS` wrapped in `$derived`. Autofixer: clean.

### 7. `InvoiceForm.svelte` / edit-create split — `$effect` malpractice — **FIXED**

Load/cancel via `onMount` / `onDestroy` + `AbortController` in `EditInvoiceForm` / `CreateInvoiceForm`. Autofixer: clean.

---

## Clean Patterns Confirmed

- **Keyed `{#each}`** — list iterations use stable keys (`item.id`, `option.label`, etc.)
- **No legacy APIs** — no `on:click`, `export let`, `<slot>`, `$:` reactive statements in `src/`
- **Context** — `createContext` in `dashboard-stores-context.svelte.ts`
- **Auth / Form remote functions** — login, signup, forgot/reset password, settings, `Form.svelte`: autofixer clean
- **Writable `$derived` in `LineItemRow`** — `unitPrice` override-until-deps-change is valid documented pattern

---

## Files Scanned Clean (July 2026)

Autofixer issues + suggestions empty (except noted above):

- `InvoiceRow.svelte`, `ClientRow.svelte`, `InvoiceForm.svelte`
- `EditInvoiceForm.svelte`, `CreateInvoiceForm.svelte`, `InvoiceFormLayout.svelte`
- `ClientForm.svelte`, `ClientField.svelte`
- `Search.svelte`, `Pagination.svelte`, `PaginatedList.svelte`
- `Form.svelte`, `Swipeable.svelte`, `ConfirmDelete.svelte`, `Alert.svelte`
- `AdditionalOptions.svelte`, `AdditionalOptionsList.svelte`
- `LineItemRow.svelte`, `LineItemRows.svelte`
- `Navbar.svelte`, `Input.svelte`
- `ItemPanel.svelte.ts`, `Toggle.svelte.ts`, `dashboard-stores-context.svelte.ts`
- Auth pages: login, signup, forgot-password, reset-password
- Dashboard: invoices/+page, clients/+page, clients/\[id\]/+page, settings/+page, +layout
- Invoice detail: invoices/\[id\]/+page, invoices/\[id\]/+layout
- Landing: Features.svelte

---

## Recommendations

1. **Leave swipe `$effect`** — DOM/listener side effects are correct.
2. **Re-run periodically** — `bun x @sveltejs/mcp svelte-autofixer <file> --svelte-version 5` on changed `.svelte` / `.svelte.ts` files.

---

## How to Re-run Analysis

```bash
bun x @sveltejs/mcp svelte-autofixer ./src/path/to/Component.svelte --svelte-version 5
```

Or use Svelte MCP `svelte-autofixer` with:

- `code`: Full component/module source
- `desired_svelte_version`: 5
- `filename`: Component name (e.g. `InvoiceRow.svelte`)
