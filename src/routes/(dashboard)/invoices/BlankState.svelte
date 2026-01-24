<script>
  import BlankState from '$lib/components/BlankState.svelte';
  import InvoiceRowHeader from './InvoiceRowHeader.svelte';
</script>

<BlankState message="Add Your First Invoice">
  {#snippet header()}
    <InvoiceRowHeader emptyState={true} />
  {/snippet}
</BlankState>
