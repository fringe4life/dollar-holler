<script lang="ts">
  import { css, cx } from "styled-system/css";
  import { circle, gridItem } from "styled-system/patterns";
  import Skeleton from "$lib/components/ui/skeleton/skeleton.svelte";
  import { tableRowBase } from "$lib/styles";
  import { invoiceRow, invoiceTable } from "../styles";
</script>

<div class={css({ position: "relative", isolation: "isolate" })}>
  <div
    class={cx(
      invoiceTable,
      invoiceRow,
      tableRowBase,
    )}
  >
    <!-- status: badge-shaped pill ~54px wide -->
    <div
      class={gridItem({
        justifySelf: { base: "end", lg: "start" },
        gridArea: "status",
      })}
    >
      <Skeleton
        class={css({
          bg: "prim/40",
          rounded: "full",
          aspectRatio: "9/4",
          inlineSize: "54px",
        })}
      />
    </div>

    <!-- duedate: fits 100px col on desktop -->
    <div class={gridItem({ gridArea: "duedate" })}>
      <Skeleton
        class={css({ bg: "prim/40", aspectRatio: "5/1", inlineSize: 20 })}
      />
    </div>

    <!-- invoicenumber: 100px col on desktop -->
    <div class={gridItem({ gridArea: "invoicenumber" })}>
      <Skeleton class={css({ bg: "prim/40", blockSize: 4, inlineSize: 25 })} />
    </div>

    <!-- clientname: 100px col on desktop -->
    <div class={gridItem({ gridArea: "clientName" })}>
      <Skeleton
        class={css({ bg: "prim/40", aspectRatio: "4/1", inlineSize: 20 })}
      />
    </div>

    <!-- amount: right-aligned, ~80px -->
    <div class={gridItem({ gridArea: "amount", justifySelf: "end" })}>
      <Skeleton
        class={css({ bg: "prim/40", aspectRatio: "5/1", inlineSize: 20 })}
      />
    </div>

    <!-- view: 32px circle, hidden on mobile -->
    <div
      class={gridItem({
        display: { base: "none", lg: "block" },
        placeSelf: "center",
        gridArea: "view",
      })}
    >
      <Skeleton class={circle({ bg: "prim/40", size: 8 })} />
    </div>

    <!-- threeDots: 32px circle, hidden on mobile -->
    <div
      class={gridItem({
        display: { base: "none", lg: "block" },
        placeSelf: "center",
        gridArea: "threeDots",

      })}
    >
      <Skeleton class={circle({ bg: "prim/40", size: 8 })} />
    </div>
  </div>
</div>
