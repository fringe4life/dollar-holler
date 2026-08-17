<script lang="ts">
  import type { InvoiceFormProps } from "#features/line-items/types.ts";
  import Spinner from "#lib/components/Spinner.svelte";
  import CreateInvoiceForm from "./CreateInvoiceForm.svelte";
  import EditInvoiceForm from "./EditInvoiceForm.svelte";
  import BoundaryError from "#lib/components/BoundaryError.svelte";

  let { mode = "create", closePanel, invoiceId }: InvoiceFormProps = $props();
</script>

<svelte:boundary>
  {#snippet pending()}
    <Spinner label="Loading invoice form" size="lg" />
  {/snippet}
  {#snippet failed(err, reset)}
    <BoundaryError
      error={err}
      fallbackMessage="Failed to load invoice form"
      onRetry={reset}
      title="We couldn't load the invoice form"
    />
  {/snippet}
  {#if mode === "edit" && invoiceId}
    <EditInvoiceForm {closePanel} {invoiceId} />
  {:else}
    <CreateInvoiceForm {closePanel} />
  {/if}
</svelte:boundary>
