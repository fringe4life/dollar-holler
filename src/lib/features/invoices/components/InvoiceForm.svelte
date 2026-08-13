<script lang="ts">
  import type { InvoiceFormProps } from "#features/line-items/types";
  import LineItemSkeleton from "#features/line-items/components/LineItemSkeleton.svelte";
  import CreateInvoiceForm from "./CreateInvoiceForm.svelte";
  import EditInvoiceForm from "./EditInvoiceForm.svelte";

  let { mode = "create", closePanel, invoiceId }: InvoiceFormProps = $props();
</script>

<svelte:boundary>
  {#snippet pending()}
    <LineItemSkeleton />
  {/snippet}
  {#if mode === "edit" && invoiceId}
    <EditInvoiceForm {closePanel} {invoiceId} />
  {:else}
    <CreateInvoiceForm {closePanel} />
  {/if}
</svelte:boundary>
