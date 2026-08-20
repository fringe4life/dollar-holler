<script lang="ts">
  import type { InvoiceFormProps } from "#features/line-items/types.ts";
  import BoundaryError from "#lib/components/patterns/BoundaryError.svelte";
  import Spinner from "#lib/components/primitives/Spinner.svelte";
  import InvoiceEditor from "./InvoiceEditor.svelte";

  let props: InvoiceFormProps = $props();
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
  <InvoiceEditor {...props} />
</svelte:boundary>
