<script lang="ts">
  import type { InvoiceFormProps } from "$features/line-items/types";
  import CreateInvoiceForm from "./CreateInvoiceForm.svelte";
  import EditInvoiceForm from "./EditInvoiceForm.svelte";

  let { mode = "create", closePanel, invoiceEdit }: InvoiceFormProps = $props();
</script>

{#if mode === "edit" && invoiceEdit}
  <EditInvoiceForm {closePanel} {invoiceEdit} />
{:else}
  <CreateInvoiceForm {closePanel} />
{/if}
