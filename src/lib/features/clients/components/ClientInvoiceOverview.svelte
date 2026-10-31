<script lang="ts" module>
  import type { ClientInvoiceSummaryFinal as SummaryFinal } from "#features/invoices/utils/client-invoice-summary.ts";
  import type { SummaryBucket as Bucket } from "#features/invoices/utils/gauge-arcs.ts";

  const countOf = (summary: SummaryFinal, bucket: Bucket): number => {
    if (bucket === "overdue") {
      return summary.overdueCount;
    }
    if (bucket === "outstanding") {
      return summary.outstandingCount;
    }
    return bucket === "draft" ? summary.draftCount : summary.paidCount;
  };
</script>

<script lang="ts">
  import { asset } from "$app/paths";
  import type { BitsButton } from "#lib/types.ts";
  import { convertMonthYear } from "#lib/utils/dateHelpers.ts";
  import { centsToDollars } from "#lib/utils/moneyHelpers.ts";
  import type { ClientSelect } from "#features/clients/types.ts";
  import ClientInvoiceGauge from "#features/clients/components/ClientInvoiceGauge.svelte";
  import ClientInvoicePlate from "#features/clients/components/ClientInvoicePlate.svelte";
  import InvoiceSummaryItem from "#features/invoices/components/InvoiceSummaryItem.svelte";
  import {
    clientSummaryEmptyBody,
    clientSummaryEmptyPanel,
    clientSummaryEmptyTitle,
    clientSummaryGauge,
    clientSummaryGaugeCol,
    clientSummaryHero,
    clientSummaryHeroEmpty,
    clientSummarySection,
  } from "#features/invoices/styles/invoice-summary-styles.ts";
  import type { ClientInvoiceSummaryFinal } from "#features/invoices/utils/client-invoice-summary.ts";
  import {
    SUMMARY_BUCKETS,
    buildGaugeArcs,
    gaugeWeights,
    type SummaryBucket,
  } from "#features/invoices/utils/gauge-arcs.ts";

  interface Props {
    client: Pick<
      ClientSelect,
      "clientStatus" | "createdAt" | "email" | "name"
    > & {
      address: { city: string; state: string; street: string; zip: string };
    };
    onEdit: BitsButton;
    /** A filtered summary's zeros mean "no matches", not "no invoices". */
    hasQuery?: boolean;
    /** `undefined` while the summary query is pending. */
    summary?: ClientInvoiceSummaryFinal;
  }

  let { client, onEdit, hasQuery = false, summary }: Props = $props();

  const BUCKET_LABELS: Record<SummaryBucket, string> = {
    draft: "Draft",
    outstanding: "Outstanding",
    overdue: "Overdue",
    paid: "Paid",
  };

  const isArchived = $derived(client.clientStatus === "archive");
  const arcs = $derived(summary ? buildGaugeArcs(gaugeWeights(summary)) : []);
  const since = $derived(convertMonthYear(client.createdAt));

  /**
   * Counts, not money: a draft invoice with no line items is still an invoice,
   * and `$0` totals for it are correct.
   */
  const invoiceCount = $derived(
    summary
      ? summary.draftCount +
          summary.outstandingCount +
          summary.overdueCount +
          summary.paidCount
      : 0
  );
  const isEmpty = $derived(
    summary !== undefined && invoiceCount === 0 && !hasQuery
  );
  /** Ghost when there is nothing drawable (no invoices, $0-only, or empty search). */
  const showGhostRing = $derived(summary !== undefined && arcs.length === 0);

  const buckets = $derived(
    SUMMARY_BUCKETS.map((bucket) => ({
      amount: summary ? centsToDollars(summary[bucket]) : undefined,
      bucket,
      count: summary ? countOf(summary, bucket) : undefined,
      label: BUCKET_LABELS[bucket],
    }))
  );
</script>

<section
  aria-label="Client totals"
  class={clientSummarySection}
  data-state={isArchived ? "archive" : "active"}
>
  <div class={isEmpty ? clientSummaryHeroEmpty : clientSummaryHero}>
    <div class={clientSummaryGaugeCol}>
      <div class={clientSummaryGauge}>
        <ClientInvoiceGauge
          {arcs}
          {showGhostRing}
          summaryLoaded={summary !== undefined}
        />

        <ClientInvoicePlate
          {buckets}
          {client}
          {isArchived}
          {isEmpty}
          {onEdit}
          {since}
          {summary}
        />
      </div>
    </div>

    {#if isEmpty}
      <div
        class={clientSummaryEmptyPanel}
        style:--arrow-up-left={`url(${asset("images/arrow-left-up.svg")})`}
        style:--arrow-up-right={`url(${asset("images/arrow-right-up.svg")})`}
      >
        <p class={clientSummaryEmptyTitle} data-role="empty-title">
          No invoices yet
        </p>
        <p class={clientSummaryEmptyBody}>
          Invoices you create for this client will appear here.
        </p>
      </div>
    {:else}
      {#each buckets as bucket (bucket.bucket)}
        <InvoiceSummaryItem
          amount={bucket.amount}
          bucket={bucket.bucket}
          count={bucket.count}
          label={bucket.label}
        />
      {/each}
    {/if}
  </div>
</section>
