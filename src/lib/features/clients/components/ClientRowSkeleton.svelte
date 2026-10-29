<script lang="ts">
  import { css, cx } from "#styled-system/css/index.js";
  import { cq } from "#styled-system/patterns/index.js";
  import Skeleton from "#lib/components/primitives/skeleton/skeleton.svelte";
  import {
    rowActionButtonGroup,
    rowActionLabel,
    rowActionRail,
    tableRowBase,
  } from "#lib/styles.ts";
  import {
    clientBalance,
    clientName,
    clientReceived,
    clientRow,
    clientStatus,
    clientSwipeHint,
    clientTable,
  } from "../styles";
</script>

<div class={cx(cq({ name: "item-row" }), clientTable, clientRow, tableRowBase)}>
  <div class={clientName}>
    <Skeleton class={css({ blockSize: 5, inlineSize: 28 })} />
  </div>
  <div class={clientStatus}>
    <Skeleton class={css({ blockSize: 5, inlineSize: 16 })} />
  </div>
  <div class={clientReceived}>
    <Skeleton class={css({ blockSize: 4, inlineSize: 20 })} />
  </div>
  <div class={clientBalance}>
    <Skeleton class={css({ blockSize: 4, inlineSize: 16 })} />
  </div>
  <div class={clientSwipeHint}>
    <Skeleton class={css({ blockSize: 2.5, inlineSize: 28 })} />
    <Skeleton class={css({ blockSize: 2.5, inlineSize: 18 })} />
  </div>
  <div class={cx(rowActionRail, css({ pointerEvents: "none" }))}>
    <span class={rowActionLabel}>Actions</span>
    <div class={rowActionButtonGroup}>
      <Skeleton class={css({ blockSize: 8, inlineSize: 14 })} />
      <Skeleton class={css({ blockSize: 8, inlineSize: 14 })} />
      <Skeleton class={css({ blockSize: 8, inlineSize: 14 })} />
    </div>
  </div>
</div>
