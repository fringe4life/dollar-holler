<script lang="ts">
  import BoundaryError from "#lib/components/BoundaryError.svelte";
  import { listClientInvoices } from "#features/clients/clients.remote.ts";
  import BlankState from "#features/clients/components/BlankState.svelte";
  import InvoiceRow from "#features/invoices/components/InvoiceRow.svelte";
  import InvoiceRowHeader from "#features/invoices/components/InvoiceRowHeader.svelte";
  import InvoiceRowSkeleton from "#features/invoices/components/InvoiceRowSkeleton.svelte";
  import type { InvoiceListResponse } from "#features/invoices/types.ts";
  import NoSearchResults from "#features/pagination/components/NoSearchResults.svelte";
  import PaginatedList from "#features/pagination/components/PaginatedList.svelte";
  import PaginatedListSkeleton from "#features/pagination/components/PaginatedListSkeleton.svelte";
  import type { PaginationSearchParams } from "#features/pagination/types.ts";
  import type { CursorId } from "#lib/types.ts";

  interface Props {
    clientId: CursorId;
    listQuery: PaginationSearchParams;
    onDelete: (invoice: InvoiceListResponse) => void;
    onEdit: (invoice: InvoiceListResponse) => void;
    onSendInvoice: (invoice: InvoiceListResponse) => void;
  }

  let { clientId, listQuery, onDelete, onEdit, onSendInvoice }: Props =
    $props();

  const invoices = $derived(await listClientInvoices({ clientId, listQuery }));
</script>

<svelte:boundary>
  {#snippet pending()}
    <PaginatedListSkeleton>
      {#snippet header()}
        <InvoiceRowHeader />
      {/snippet}
      {#snippet skeleton()}
        <InvoiceRowSkeleton />
      {/snippet}
    </PaginatedListSkeleton>
  {/snippet}
  {#snippet failed(err, reset)}
    <BoundaryError
      error={err}
      fallbackMessage="Failed to load invoices"
      onRetry={reset}
      title="We couldn’t load this client’s invoices"
    />
  {/snippet}

  <PaginatedList
    items={invoices.items}
    paginationMetadata={invoices.paginationMetadata}
  >
    {#snippet header()}
      <InvoiceRowHeader />
    {/snippet}
    {#snippet row(item)}
      <InvoiceRow invoice={item} {onDelete} {onEdit} {onSendInvoice} />
    {/snippet}
    {#snippet blankState()}
      <BlankState />
    {/snippet}
    {#snippet noResults()}
      <NoSearchResults>
        {#snippet header()}
          <InvoiceRowHeader emptyState={true} />
        {/snippet}
      </NoSearchResults>
    {/snippet}
  </PaginatedList>
</svelte:boundary>
