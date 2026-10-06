<script lang="ts">
  import { cx } from "#styled-system/css/index.js";
  import {
    invoiceSummaryAmountClass,
    invoiceSummaryItemBaseClass,
    invoiceSummaryLabelClass,
  } from "#features/invoices/styles/invoice-summary-styles.ts";

  interface Props {
    amount: string;
    class: string;
    title: string;
  }

  let { amount, class: className, title }: Props = $props();
</script>

<div class={cx(invoiceSummaryItemBaseClass, className)}>
  <dt class={invoiceSummaryLabelClass}>{title}</dt>
  <dd class={invoiceSummaryAmountClass}>{amount}</dd>
</div>
