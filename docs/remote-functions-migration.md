# Dashboard data: SvelteKit remote functions

Dashboard reads and writes go through SvelteKit remotes (`query` / `form` / `command`). Pages `await` queries inside `<svelte:boundary>`. Subsequent URL-driven list updates use `$effect.pending()`.

Elysia, Eden Treaty, OpenAPI/Scalar, dashboard CRUD stores, and domain `+page.server.ts` loads are gone. Better Auth HTTP stays at `/api/auth` via `svelteKitHandler` in `src/hooks.server.ts`. Root `+layout.server.ts` still passes `user` for nav/SSR.

```
+page.svelte await query  →  *.remote.ts  →  requireUser / requireUserMutation
command / form            →  *.remote.ts  →  feature *.server.ts Drizzle helpers
Better Auth /api/auth     →  svelteKitHandler
```

Opt-in: `kit.experimental.remoteFunctions` and `compilerOptions.experimental.async` in `vite.config.ts`.

## Remote modules

| File | Reads (`query`) | Writes |
| --- | --- | --- |
| `src/lib/features/auth/auth.remote.ts` | — | `form` login/signup/forgot/reset/change-password; `command` logout |
| `src/lib/features/invoices/invoices.remote.ts` | `listInvoices`, `getInvoice`, `getInvoiceDetail` | `command` create/update/delete/status |
| `src/lib/features/clients/clients.remote.ts` | `listClients`, `getClient`, `clientPickerOptions`, `listClientInvoices`, `clientInvoiceSummary` | `command` create/update/delete/status |
| `src/lib/features/line-items/line-items.remote.ts` | `listLineItemsForEdit` | `command` create/replace/delete |
| `src/lib/features/settings/settings.remote.ts` | `getSettings` (row or `null`) | `command` create/update (PATCH delta via `settings-diff.ts`) |

Auth on remotes: `requireUser()` (`locals.user`) for queries; `requireUserMutation()` (cookie cache off) for writes. Both live in `src/lib/features/auth/require-user.server.ts` (feature zone — remotes cannot import `src/lib/server/**` under Fallow).

List args match `listQuerySchema` / `PaginationSearchParams` (numeric `limit` 10 \| 25 \| 50). URL still goes through `normalizeListQueryFromUrl` / `visibleListUrl` (shallow `goto`).

## UI

List pages:

```svelte
const listArg =
$derived(normalizeListQueryFromUrl(visibleListUrl(page)).normalized); const list
= $derived(await listInvoices(listArg));
```

- First resolve → boundary `{#snippet pending()}` (row skeletons).
- Search / cursor / limit → `$effect.pending()` on `PaginatedList`.
- Errors → `{#snippet failed(error, reset)}`.
- Mutations → `.updates(listInvoices(arg))` on the client; `requested(query, limit).refreshAll()` / `.set()` on the server.

`PaginatedList` takes `items` + `paginationMetadata` + `pending`. `Search` / `Pagination` only shallow-`goto`. `ItemPanel` still owns create/edit/delete chrome.

Invoice detail `await getInvoiceDetail(id)` and `await getSettings()` (settings used to be unloaded unless the user visited `/settings` first). Logout page `await logout()`.

## Keep vs gone

| Keep | Gone |
| --- | --- |
| Drizzle helpers (`fetchPaginatedInvoices`, write helpers, verify-*) | Elysia app, `/api/[...slugs]`, Eden `apiClient` |
| ArkType schemas, URL `q`/`cursor`/`limit` | OpenAPI / Scalar, bearer plugin |
| ItemPanel modals | Dashboard CRUD stores + store bases |
| Better Auth `/api/auth` via hooks | Domain `+page.server.ts` loads |
| Root layout `user` |  |

## Loading / abort notes

[`getAbortSignal()`](https://svelte.dev/docs/svelte/svelte#getAbortSignal) aborts when the current `$derived` / `$effect` re-runs. Remote `query` / `command` / `form` do **not** take an `AbortSignal` yet ([sveltejs/kit#14502](https://github.com/sveltejs/kit/issues/14502)). `$derived(await listInvoices(arg))` is still the pattern; UI follows the current derived arg. Store-style abort controllers are not needed.

## References

- [Remote functions](https://svelte.dev/docs/kit/remote-functions)
- [`$app/server`](https://svelte.dev/docs/kit/$app-server)
- [`<svelte:boundary>`](https://svelte.dev/docs/svelte/svelte-boundary)
- [`$effect.pending()`](https://svelte.dev/docs/svelte/$effect#$effect.pending)
