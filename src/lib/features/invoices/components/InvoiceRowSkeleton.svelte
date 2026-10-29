<script lang="ts">
  import { css, cx } from "#styled-system/css/index.js";
  import { cq, circle } from "#styled-system/patterns/index.js";
  import Skeleton from "#lib/components/primitives/skeleton/skeleton.svelte";
  import {
    rowActionButtonGroup,
    rowActionLabel,
    rowActionRail,
    tableRowBase,
  } from "#lib/styles.ts";
  import {
    invoiceAmount,
    invoiceClientName,
    invoiceDueDate,
    invoiceIdentity,
    invoiceRow,
    invoiceStatus,
    invoiceSwipeHint,
    invoiceTable,
  } from "../styles";
</script>

<div
  class={cx(cq({ name: "item-row" }), invoiceTable, invoiceRow, tableRowBase)}
>
  <div class={invoiceIdentity}>
    <Skeleton class={css({ blockSize: 3, inlineSize: 24 })} />
  </div>
  <div class={invoiceClientName}>
    <Skeleton class={css({ blockSize: 5, inlineSize: 28 })} />
  </div>
  <div class={invoiceDueDate}>
    <Skeleton class={css({ blockSize: 3, inlineSize: 20 })} />
  </div>
  <div class={invoiceAmount}>
    <Skeleton class={css({ blockSize: 5, inlineSize: 16 })} />
  </div>
  <div class={invoiceStatus}>
    <Skeleton class={css({ blockSize: 5, inlineSize: 14 })} />
  </div>
  <div class={invoiceSwipeHint}>
    <Skeleton class={css({ blockSize: 2.5, inlineSize: 28 })} />
    <Skeleton class={css({ blockSize: 2.5, inlineSize: 14 })} />
  </div>
  <div class={cx(rowActionRail, css({ pointerEvents: "none" }))}>
    <span class={rowActionLabel}>Actions</span>
    <div class={rowActionButtonGroup}>
      <Skeleton class={css({ blockSize: 8, inlineSize: 14 })} />
      <Skeleton class={css({ blockSize: 8, inlineSize: 14 })} />
      <Skeleton class={css({ blockSize: 8, inlineSize: 14 })} />
      <Skeleton class={circle({ size: 8 })} />
    </div>
  </div>
</div>
