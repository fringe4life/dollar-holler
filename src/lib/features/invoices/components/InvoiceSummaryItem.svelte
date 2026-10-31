<script lang="ts">
  import { cx } from "#styled-system/css/index.js";
  import Skeleton from "#lib/components/primitives/skeleton/skeleton.svelte";
  import { money } from "#lib/components/primitives/money/money.ts";
  import {
    clientSummarySkeletonLine,
    clientTotalsAmount,
    clientTotalsCard,
    clientTotalsCount,
    clientTotalsKey,
    clientTotalsTerm,
  } from "#features/invoices/styles/invoice-summary-styles.ts";
  import type { SummaryBucket } from "#features/invoices/utils/gauge-arcs.ts";

  interface Props {
    bucket: SummaryBucket;
    label: string;
    /** Cents already formatted; `undefined` renders the loading state. */
    amount?: string;
    count?: number;
    class?: string;
  }

  let { amount, bucket, class: className, count, label }: Props = $props();

  const countLabel = $derived(
    count === undefined
      ? ""
      : `${count} ${count === 1 ? "invoice" : "invoices"}`
  );
</script>

<button
  class={cx(clientTotalsCard({ bucket }), className)}
  data-bucket={amount === undefined ? undefined : bucket}
  type="button"
>
  <span class={clientTotalsTerm} data-role="term">
    <span aria-hidden="true" class={clientTotalsKey({ bucket })} data-role="key"
    ></span>
    {label}
    <span class={clientTotalsCount}>{countLabel}</span>
  </span>
  {#if amount === undefined}
    <Skeleton class={clientSummarySkeletonLine} style="inline-size: 6rem" />
  {:else}
    <span class={cx(money(), clientTotalsAmount({ bucket }))} data-role="amount"
      >{amount}</span
    >
  {/if}
</button>
