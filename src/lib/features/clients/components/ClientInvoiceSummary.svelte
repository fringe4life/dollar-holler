<script lang="ts">
  import { visuallyHidden } from "#styled-system/patterns/index.js";
  import BoundaryError from "#lib/components/patterns/BoundaryError.svelte";
  import type { CursorId } from "#lib/schemas/cursor-id.ts";
  import type { BitsButton } from "#lib/types.ts";
  import ClientInvoiceOverview from "#features/clients/components/ClientInvoiceOverview.svelte";
  import { clientInvoiceSummary } from "#features/clients/clients.remote.ts";
  import type { ClientSelect } from "#features/clients/types.ts";

  interface Props {
    client: ClientSelect;
    clientId: CursorId;
    onEdit: BitsButton;
    q?: string;
  }

  let { client, clientId, onEdit, q }: Props = $props();

  const summaryArg = $derived(q === undefined ? { clientId } : { clientId, q });
  const summary = $derived(await clientInvoiceSummary(summaryArg));

  /** Identity renders in every state, so the name survives a pending/failed summary. */
  const identity = $derived({
    address: {
      city: client.city,
      state: client.state,
      street: client.street,
      zip: client.zip,
    },
    clientStatus: client.clientStatus,
    createdAt: client.createdAt,
    email: client.email,
    name: client.name,
  });
</script>

<!--
  #207 boundary choice: keep Kit `<svelte:boundary>` around the summary query.
  No ogygia lake/island — the hero streams with the page; navbar toast context
  still requires Kit on the dashboard shell.
-->
<svelte:boundary>
  {#snippet pending()}
    <div aria-busy="true" aria-live="polite" role="status">
      <span class={visuallyHidden()}>Loading client totals</span>
      <ClientInvoiceOverview client={identity} {onEdit} />
    </div>
  {/snippet}
  {#snippet failed(error, reset)}
    <BoundaryError
      {error}
      fallbackMessage="Failed to load summary"
      onRetry={reset}
      title="We couldn't load {client.name}'s totals"
    />
  {/snippet}

  <ClientInvoiceOverview
    client={identity}
    hasQuery={Boolean(q)}
    {onEdit}
    {summary}
  />
</svelte:boundary>
