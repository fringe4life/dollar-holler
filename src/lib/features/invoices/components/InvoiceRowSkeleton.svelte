<script lang="ts">
  import { css, cx } from "styled-system/css";
  import { circle, gridItem } from "styled-system/patterns";
  import Skeleton from "$lib/components/ui/skeleton/skeleton.svelte";
  import { invoiceRow, invoiceTable, tableRowBase } from "$lib/styles";
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
    <!-- "status justify-self-end lg:justify-self-start" -->
    <div
      class={gridItem({
        justifySelf: { base: "end", lg: "start" },
        gridArea: "status",
      })}
    >
      <!-- "bg-prim/40 rounded-full block-6 inline-[54px]" -->
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
    <!-- "bg-prim/40 block-4 inline-20" -->
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
    <!-- "viewbutton hidden place-self-center lg:block" -->
    <div
      class={gridItem({
        display: { base: "none", lg: "block" },
        placeSelf: "center",
        gridArea: "view",
      })}
    >
      <!-- "bg-prim/40 aspect-square rounded-full block-8" -->
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
