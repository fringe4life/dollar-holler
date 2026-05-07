<script>
  import BlankState from "$features/pagination/components/BlankState.svelte";
  import ClientRowHeader from "./ClientRowHeader.svelte";
</script>

<BlankState message="Add Your First Client">
  {#snippet header()}
    <ClientRowHeader emptyState={true} />
  {/snippet}
</BlankState>
