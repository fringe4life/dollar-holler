<script>
  import BlankState from "$features/pagination/components/BlankState.svelte";
  import InvoiceRowHeader from "./InvoiceRowHeader.svelte";
</script>

<BlankState message="Add Your First Invoice">
  {#snippet header()}
    <InvoiceRowHeader emptyState={true} />
  {/snippet}
</BlankState>
