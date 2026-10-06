<script lang="ts">
  import BoundaryError from "#lib/components/patterns/BoundaryError.svelte";
  import { clientInvoiceSummary } from "#features/clients/clients.remote.ts";
  import InvoiceSummaryItem from "#features/invoices/components/InvoiceSummaryItem.svelte";
  import InvoiceSummarySkeleton from "#features/invoices/components/InvoiceSummarySkeleton.svelte";
  import {
    invoiceSummaryCardClass,
    invoiceSummaryContainerClass,
    invoiceSummaryDraftClass,
    invoiceSummaryListClass,
    invoiceSummaryOutstandingClass,
    invoiceSummaryOverdueClass,
    invoiceSummaryPaidClass,
  } from "#features/invoices/styles/invoice-summary-styles.ts";
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
    outstanding: centsToDollars(summary.outstanding),
    overdue: centsToDollars(summary.overdue),
    paid: centsToDollars(summary.paid),
  });
</script>

<svelte:boundary>
  {#snippet pending()}
    <div
      aria-label="Loading client totals"
      aria-live="polite"
      class={invoiceSummaryContainerClass}
      role="status"
    >
      <div aria-hidden="true" class={invoiceSummaryCardClass}>
        <div class={invoiceSummaryListClass}>
          <InvoiceSummarySkeleton class={invoiceSummaryOverdueClass} />
          <InvoiceSummarySkeleton class={invoiceSummaryOutstandingClass} />
          <InvoiceSummarySkeleton class={invoiceSummaryDraftClass} />
          <InvoiceSummarySkeleton class={invoiceSummaryPaidClass} />
        </div>
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

  <section aria-label="Client totals" class={invoiceSummaryContainerClass}>
    <div class={invoiceSummaryCardClass}>
      <dl class={invoiceSummaryListClass}>
        <InvoiceSummaryItem
          amount={totals.overdue}
          class={invoiceSummaryOverdueClass}
          title="Overdue"
        />
        <InvoiceSummaryItem
          amount={totals.outstanding}
          class={invoiceSummaryOutstandingClass}
          title="Outstanding"
        />
        <InvoiceSummaryItem
          amount={totals.draft}
          class={invoiceSummaryDraftClass}
          title="Draft"
        />
        <InvoiceSummaryItem
          amount={totals.paid}
          class={invoiceSummaryPaidClass}
          title="Paid"
        />
      </dl>
    </div>
  </section>
</svelte:boundary>
