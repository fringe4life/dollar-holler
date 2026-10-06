<script lang="ts">
  import { cx } from "#styled-system/css/index.js";
  import Skeleton from "#lib/components/primitives/skeleton/skeleton.svelte";
  import {
    invoiceSummaryItemBaseClass,
    invoiceSummarySkeletonAmountClass,
    invoiceSummarySkeletonLabelClass,
  } from "#features/invoices/styles/invoice-summary-styles.ts";

  interface Props {
    class: string;
  }

  let { class: className }: Props = $props();
</script>

<div aria-hidden="true" class={cx(invoiceSummaryItemBaseClass, className)}>
  <Skeleton class={invoiceSummarySkeletonLabelClass} />
  <Skeleton class={invoiceSummarySkeletonAmountClass} />
</div>
