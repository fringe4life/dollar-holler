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
  import { cx } from "#styled-system/css/index.js";
  import InitialsAvatar from "#lib/components/primitives/avatar/InitialsAvatar.svelte";
  import Badge from "#lib/components/primitives/badge/badge.svelte";
  import Button from "#lib/components/primitives/button/button.svelte";
  import Edit from "#lib/components/primitives/icons/Edit.svelte";
  import { money } from "#lib/components/primitives/money/money.ts";
  import Skeleton from "#lib/components/primitives/skeleton/skeleton.svelte";
  import type { BitsButton } from "#lib/types.ts";
  import { convertMonthYear } from "#lib/utils/dateHelpers.ts";
  import { centsToDollars } from "#lib/utils/moneyHelpers.ts";
  import type { ClientSelect } from "#features/clients/types.ts";
  import InvoiceSummaryItem from "#features/invoices/components/InvoiceSummaryItem.svelte";
  import {
    clientSummaryAddress,
    clientSummaryArc,
    clientSummaryArcSweep,
    clientSummaryAvatar,
    clientSummaryBadge,
    clientSummaryEditButton,
    clientSummaryEmail,
    clientSummaryEmptyBody,
    clientSummaryEmptyPanel,
    clientSummaryEmptyTitle,
    clientSummaryFields,
    clientSummaryGauge,
    clientSummaryGaugeCol,
    clientSummaryGhostRing,
    clientSummaryHead,
    clientSummaryHero,
    clientSummaryHeroEmpty,
    clientSummaryIdentity,
    clientSummaryMeta,
    clientSummaryName,
    clientSummaryPlate,
    clientSummaryReadout,
    clientSummaryReadoutAmount,
    clientSummaryReadoutItem,
    clientSummaryReadoutLabel,
    clientSummarySection,
    clientSummarySince,
    clientSummarySkeletonLine,
    clientSummarySkeletonRing,
    clientTotalsKey,
  } from "#features/invoices/styles/invoice-summary-styles.ts";
  import type { ClientInvoiceSummaryFinal } from "#features/invoices/utils/client-invoice-summary.ts";
  import {
    ARC_START_DEG,
    ARC_SWEEP_DEG,
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
        {#if showGhostRing}
          <!-- Same 270deg sweep as the arcs, drawn as a dashed ghost. -->
          <svg
            aria-hidden="true"
            class={clientSummaryGhostRing}
            focusable="false"
            viewBox="0 0 100 100"
          >
            <path d="M18.9 81.1A44 44 0 1 1 81.1 81.1"></path>
          </svg>
        {:else if !summary}
          <div aria-hidden="true" class={clientSummarySkeletonRing}></div>
        {:else}
          <!-- One sweep cursor for all arcs: the mask travels the same 270deg the
               arcs occupy, so buckets light up in reading order on first paint. -->
          <div
            class={clientSummaryArcSweep}
            style="--arc-start: {ARC_START_DEG}deg; --arc-end: {ARC_START_DEG +
              ARC_SWEEP_DEG}deg; --arc-sweep: {ARC_START_DEG +
              ARC_SWEEP_DEG}deg"
          >
            {#each arcs as arc (arc.bucket)}
              <div
                aria-hidden="true"
                class={clientSummaryArc({
                  bucket: arc.bucket,
                  lead: arc.bucket === "overdue",
                })}
                data-arc={arc.bucket}
                style="--arc-from: {arc.from}deg; --arc-to: {arc.to}deg; background: conic-gradient(from 135deg, transparent 0deg var(--arc-from), currentColor var(--arc-from) var(--arc-to), transparent var(--arc-to) 360deg)"
              ></div>
            {/each}
          </div>
        {/if}

        <div class={clientSummaryPlate}>
          <div class={clientSummaryIdentity}>
            <div class={clientSummaryAvatar} data-role="avatar">
              <InitialsAvatar name={client.name} size="md" />
            </div>
            <div class={clientSummaryHead}>
              <h1
                class={clientSummaryName}
                data-role="name"
                title={client.name}
              >
                {client.name}
              </h1>
              <Button
                class={clientSummaryEditButton}
                onclick={onEdit}
                size="sm"
                variant="ghost"
              >
                <Edit height={16} width={16} />
                Edit
              </Button>
            </div>
            <div class={clientSummaryMeta}>
              <a
                class={clientSummaryEmail}
                data-role="email"
                href="mailto:{client.email}"
                title={client.email}
              >
                {client.email}
              </a>
              <Badge
                class={clientSummaryBadge}
                size="small"
                variant={isArchived ? "archive" : "active"}
              >
                {isArchived ? "Archived" : "Active"}
              </Badge>
            </div>
          </div>

          <div class={clientSummaryFields}>
            <div class={clientSummaryAddress} data-role="address">
              <p title={client.address.street}>{client.address.street}</p>
              <p>
                {client.address.city}, {client.address.state}
                {client.address.zip}
              </p>
            </div>
            <p class={clientSummarySince} data-role="since">
              <span>Client since</span>
              <strong>{since}</strong>
            </p>
          </div>

          {#if !isEmpty}
            <div class={clientSummaryReadout}>
              <div class={clientSummaryReadoutItem} data-readout="total">
                <span class={clientSummaryReadoutLabel}>Invoice totals</span>
                {#if summary}
                  <span class={cx(money(), clientSummaryReadoutAmount)}>
                    {centsToDollars(summary.grandTotal)}
                  </span>
                {:else}
                  <Skeleton
                    class={clientSummarySkeletonLine}
                    style="inline-size: 5.5rem"
                  />
                {/if}
              </div>
              {#each buckets as entry (entry.bucket)}
                {#if entry.amount}
                  <div
                    class={clientSummaryReadoutItem}
                    data-readout={entry.bucket}
                  >
                    <span class={clientSummaryReadoutLabel}>
                      <span
                        aria-hidden="true"
                        class={clientTotalsKey({ bucket: entry.bucket })}
                      ></span>
                      {entry.label}
                    </span>
                    <span class={cx(money(), clientSummaryReadoutAmount)}
                      >{entry.amount}</span
                    >
                  </div>
                {/if}
              {/each}
            </div>
          {/if}
        </div>
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
