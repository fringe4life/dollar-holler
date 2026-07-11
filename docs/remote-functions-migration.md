# Migration: Elysia + Eden + stores → SvelteKit remote functions

Plan for moving dashboard data fetching/mutations off the Elysia/Eden/store stack onto SvelteKit remote functions (`query` / `form` / `command`), with `<svelte:boundary>` and `$effect.pending()` for loading/error UI.

**Pilot surface:** invoices list (`src/routes/(dashboard)/(shell)/invoices/+page.svelte`).

**Already done:** auth forms migrated to `src/lib/features/auth/auth.remote.ts` (`form` + ArkType schemas). Project already opts into `kit.experimental.remoteFunctions` and `compilerOptions.experimental.async` in `vite.config.ts`.

---

## Current architecture (invoices)

```
SSR load (+page.server.ts)
  └─ fetchPaginatedInvoices (Drizzle)
       └─ PageData → afterNavigate hydrateFromLoad

Client InvoicesStore
  └─ Eden treaty → Elysia GET /api/invoices
       └─ same fetchPaginatedInvoices

UI
  └─ PaginatedList(store) → store.loading / store.error / store.items
  └─ Search / Pagination → pushState + store.loadItems
  └─ Mutations → store methods → Eden → local array splice + toast
```

### Pain points

- Dual path: SSR load **and** Eden for the same list query.
- Hydration dance: `loading = true` mount hack, `afterNavigate` + `hydrateFromLoad`.
- Race guards: `listAbortController`, `listLoadGeneration`, `lastSuccessfulListKey`, `presetClientListQueryKey`.
- Hand-rolled loading/error in `PaginatedList` instead of framework boundaries.
- Store owns both **data** and **UI chrome** (harder to share with remotes).

Server query helpers (`fetchPaginatedInvoices`, etc.) are already clean. Elysia mostly wraps them for OpenAPI + Eden typing.

---

## Target architecture

```
invoices.remote.ts
  query   listInvoices(listQuery) → fetchPaginatedInvoices
  form / command  create | update | delete | status
       └─ single-flight refresh / withOverride

+page.svelte
  <svelte:boundary pending / failed>
    await listInvoices(from URL or local search arg)
    PaginatedList(items, paginationMetadata, pending)
```

No store as list owner. No Eden for this feature’s UI path. `+page.server.ts` load optional once `query` covers SSR.

```
ItemPanel / modals     → keep (local UI runes)
URL q/cursor/limit     → keep (or simplify search — see below)
fetchPaginatedInvoices → keep (shared server fn)
ArkType schemas        → keep (Standard Schema works with remotes)
Elysia invoice routes  → optional (OpenAPI / external clients only)
```

---

## Remote API map

| Concern | Today | After |
| --- | --- | --- |
| List | `+page.server` + `InvoicesStore.fetchList` → Eden | `query(listQuerySchema, …)` |
| Create / edit forms | Store + Eden | Prefer `form` (progressive enhancement) |
| Row actions (send, delete) | Store + Eden | `command` + `.updates(...)` |
| Optimistic UI | Mutate `store.items` | `query.withOverride(...)` on `.updates(...)` |
| Loading (first paint) | `store.loading` | `<svelte:boundary>` `{#snippet pending()}` |
| Loading (search / page change) | `store.loading` | `$effect.pending()` |
| Errors | `store.error` in list | `{#snippet failed(error, reset)}` |

### Sketch: remote module

```ts
// src/lib/features/invoices/invoices.remote.ts
import { query, command, getRequestEvent } from "$app/server";
import { error } from "@sveltejs/kit";
import { listQuerySchema } from "$features/pagination/schemas.server";
import { fetchPaginatedInvoices } from "./queries/invoices-list.server";

export const listInvoices = query(listQuerySchema, async (normalized) => {
  const { locals } = getRequestEvent();
  if (!locals.user) error(401, "Unauthorized");
  return fetchPaginatedInvoices(locals.user.id, normalized);
});

export const updateInvoiceStatus = command(/* schema */, async (input) => {
  // mutate DB…
  // optional: void listInvoices(arg).refresh() for server-driven single-flight
});

export const deleteInvoice = command(/* schema */, async (id) => {
  // …
});
```

### Sketch: page

```svelte
<script lang="ts">
  import { page } from "$app/state";
  import {
    listInvoices,
    deleteInvoice,
    updateInvoiceStatus,
  } from "$features/invoices/invoices.remote";
  import { normalizeListQueryFromUrl } from "$features/pagination/utils/list-query";

  const listArg = $derived(normalizeListQueryFromUrl(page.url).normalized);
  const list = $derived(await listInvoices(listArg));
</script>

<svelte:boundary>
  {#snippet pending()}
    <!-- InvoiceRowSkeleton × N -->
  {/snippet}
  {#snippet failed(err, reset)}
    <p>Error: {err.message}</p>
    <button onclick={reset}>Retry</button>
  {/snippet}

  <PaginatedList
    items={list.items}
    paginationMetadata={list.paginationMetadata}
    pending={$effect.pending()}
    …
  />
</svelte:boundary>
```

### Sketch: optimistic mutation

```ts
await updateInvoiceStatus({ id, status }).updates(
  listInvoices(listArg).withOverride((data) => ({
    ...data,
    items: data.items.map((inv) =>
      inv.id === id ? { ...inv, invoiceStatus: status } : inv
    ),
  }))
);
```

On failure, override rolls back. Multiple in-flight overrides stack.

---

## Keep `PaginatedList` — change types

Do **not** delete `PaginatedList`. Retarget props away from the store contract.

Today (`PaginatableItems` / `SearchableListStore`):

- `store.items`, `store.paginationMetadata`
- `store.loading`, `store.error`
- `store.loadItems`, `presetClientListQueryKey`, `lastSuccessfulListKey`

Target shape:

```ts
interface Props<T extends CursorRow> {
  items: T[];
  paginationMetadata: PaginationMetadata;
  /** From parent `$effect.pending()` for subsequent async updates */
  pending?: boolean;
  header: Snippet;
  row: Snippet<[T]>;
  skeleton: Snippet;
  blankState?: Snippet;
  noResults?: Snippet;
  footer?: Snippet;
}
```

- First load → boundary `pending` snippet.
- Search / cursor / limit changes → `$effect.pending()` drives skeleton (boundary `pending` does **not** re-show after first resolve).
- Errors → boundary `failed` (drop inline `store.error` branch, or keep as optional fallback).

`Search` / `Pagination` also stop calling `store.loadItems`. They only update URL (or local search state); the page’s `$derived(await listInvoices(arg))` re-runs.

---

## Search / pagination URL model

### Option A — keep shallow `pushState`

Same UX as today: `pushState` updates `page.url` without full navigation; `$derived` list arg changes; query re-fetches.

Drop:

- `presetClientListQueryKey`
- abort generation / `listLoadGeneration`
- `hydrateFromLoad` / `afterNavigate` sync

View transitions can still wrap the URL update.

### Option B — simplify search

Drive list arg from local `$state` and/or URL; always:

```ts
const list = $derived(await listInvoices(listArg));
```

Loading via `$effect.pending()`. No imperative `loadItems`.

---

## `getAbortSignal` vs remote queries

[`getAbortSignal()`](https://svelte.dev/docs/svelte/svelte#getAbortSignal) returns an `AbortSignal` that aborts when the current `$derived` / `$effect` re-runs or is destroyed. Ideal for **raw `fetch`** inside async derived:

```ts
async function getData(id) {
  const res = await fetch(`/items/${id}`, { signal: getAbortSignal() });
  return res.json();
}
const data = $derived(await getData(id));
```

**Gap:** remote `query` / `command` / `form` do **not** accept an `AbortSignal` today. Open issue: [sveltejs/kit#14502](https://github.com/sveltejs/kit/issues/14502).

Implications for list search:

- `$derived(await listInvoices(arg))` is still the recommended pattern (Kit maintainers steer toward async derived + `$effect.pending()`).
- Same-arg stale overwrite is handled internally; **different** args (typing `berli` → `berlin`) can leave old requests in flight (cache fill / wasted work), but UI follows the current derived arg.
- Store-style abort controllers are not needed for correctness of displayed data; they only mattered for imperative `loadItems` races.

Use `getAbortSignal` where you still own the `fetch` (helpers, non-remote calls). Do not expect it to cancel Kit’s remote HTTP wrapper until the issue lands.

---

## React `cacheSignal` comparison

|  | React `cacheSignal` | Svelte `getAbortSignal` |
| --- | --- | --- |
| Scope | `cache()` / RSC render lifetime | Current `$derived` / `$effect` lifetime |
| Aborts when | Render done / aborted / failed | Derived/effect re-runs or destroyed |
| Client | Often `null` today | Works in client derived/effect |
| Remote query | N/A (RSC) | Not wired to Kit remote fetch |

Closest Svelte analogue to `cacheSignal` is **`getAbortSignal`**. Kit’s query cache (request-scoped on server, active-use on client) is closer to React `cache()` dedupe, but there is no public “abort when this cache entry dies” API on remotes.

Related: Svelte `fork()` is for speculative preload (e.g. link hover), not abort-on-stale-search.

---

## What dies vs stays

| Kill (for invoices UI path) | Keep |
| --- | --- |
| `InvoicesStore` as list owner | `fetchPaginatedInvoices` |
| Eden `apiClient.invoices.*` from UI | ArkType / Standard Schema |
| `hydrateFromLoad` / `afterNavigate` sync | URL `q` / `cursor` / `limit` model |
| `store.loading` / `store.error` as primary UX | `ItemPanel` modals |
| Abort-generation / list key race guards | View transitions around URL change |
| Duplicate Elysia GET if no external API need | OpenAPI routes only if still wanted |

**Shared store call sites** (create/edit forms, client detail delete via `getDashboardStores().invoices`) must move to remotes too, or temporarily wrap remotes behind a thin façade.

---

## Suggested rollout (invoices first)

1. Add `listInvoices` `query`; page uses `await` + `<svelte:boundary>`; keep mutations on store temporarily.
2. Retarget `PaginatedList` / `Search` / `Pagination` to data + URL (no `loadItems`).
3. Move delete / status / create / edit to `command` / `form` + single-flight `.updates(...)` / `withOverride`.
4. Delete invoices store usage + Eden from this feature; drop `+page.server.ts` load if query covers SSR.
5. Repeat for clients list (same pagination pattern).

---

## References

- [Remote functions](https://svelte.dev/docs/kit/remote-functions)
- [`$app/server`](https://svelte.dev/docs/kit/$app-server)
- [`<svelte:boundary>`](https://svelte.dev/docs/svelte/svelte-boundary)
- [`$effect.pending()`](https://svelte.dev/docs/svelte/$effect#$effect.pending)
- [`getAbortSignal`](https://svelte.dev/docs/svelte/svelte#getAbortSignal)
- [Abort signals for remote functions (open)](https://github.com/sveltejs/kit/issues/14502)
- Existing auth remotes: `src/lib/features/auth/auth.remote.ts`
- Pilot page: `src/routes/(dashboard)/(shell)/invoices/+page.svelte`
- List server query: `src/lib/features/invoices/queries/invoices-list.server.ts`
