<script lang="ts">
  import BoundaryError from "#lib/components/patterns/BoundaryError.svelte";
  import { grid } from "#styled-system/patterns/index.js";
  import { clientInvoiceSummary } from "#features/clients/clients.remote.ts";
  import InvoiceSummaryItem from "#features/invoices/components/InvoiceSummaryItem.svelte";
  import InvoiceSummarySkeleton from "#features/invoices/components/InvoiceSummarySkeleton.svelte";
  import type { CursorId } from "#lib/schemas/cursor-id.ts";
  import { centsToDollars } from "#lib/utils/moneyHelpers.ts";

  interface Props {
    clientId: CursorId;
    q?: string;
  }

  let { clientId, q }: Props = $props();

  const summaryArg = $derived(q === undefined ? { clientId } : { clientId, q });
  const summary = $derived(await clientInvoiceSummary(summaryArg));
  const totals = $derived({
    draft: centsToDollars(summary.draft),
    grandTotal: centsToDollars(summary.grandTotal),
    outstanding: centsToDollars(summary.outstanding),
    overdue: centsToDollars(summary.overdue),
    paid: centsToDollars(summary.paid),
  });

  const summaryGrid = grid({
    columns: { base: 1, sm: 2, lg: 4 },
    gap: 4,
    marginBlockEnd: 10,
    backgroundColor: "gallery",
    borderRadius: "lg",
    paddingInline: { base: 6, md: 8, lg: 10 },
    paddingBlock: { base: 4, md: 6, lg: 8 },
  });
</script>

<svelte:boundary>
  {#snippet pending()}
    <div aria-label="Loading invoice summary" aria-live="polite" role="status">
      <div class={summaryGrid}>
        {#each { length: 4 } as _, index (index)}
          <InvoiceSummarySkeleton />
        {/each}
      </div>
    </div>
  {/snippet}
  {#snippet failed(err, reset)}
    <BoundaryError
      error={err}
      fallbackMessage="Failed to load summary"
      onRetry={reset}
      title="We couldn't load the invoice summary"
    />
  {/snippet}

  <div class={summaryGrid}>
    <InvoiceSummaryItem amount={totals.overdue} title="Total Overdue" />
    <InvoiceSummaryItem amount={totals.outstanding} title="Total Outstanding" />
    <InvoiceSummaryItem amount={totals.draft} title="Total Draft" />
    <InvoiceSummaryItem amount={totals.paid} title="Total Paid" />
  </div>
</svelte:boundary>
