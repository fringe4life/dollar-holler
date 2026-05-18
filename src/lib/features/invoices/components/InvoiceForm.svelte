<script lang="ts">
  import type { InvoiceFormProps } from "$features/line-items/types";
  import CreateInvoiceForm from "./CreateInvoiceForm.svelte";
  import EditInvoiceForm from "./EditInvoiceForm.svelte";

  let { mode = "create", closePanel, invoiceId }: InvoiceFormProps = $props();
</script>

{#if mode === "edit" && invoiceId}
  <EditInvoiceForm {closePanel} {invoiceId} />
{:else}
  <CreateInvoiceForm {closePanel} />
{/if}
