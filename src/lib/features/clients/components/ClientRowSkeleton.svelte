<script lang="ts">
  import { css, cx } from "styled-system/css";
  import { circle, gridItem } from "styled-system/patterns";
  import Skeleton from "$lib/components/ui/skeleton/skeleton.svelte";
  import { tableRowBase } from "$lib/styles";
  import { clientRow, clientTable } from "../styles";
</script>

<div class={css({ position: "relative", isolation: "isolate" })}>
  <div
    class={cx(
      clientTable,
      clientRow,
      tableRowBase,
    )}
  >
    <!-- status: badge-shaped pill ~54px wide -->
    <div
      class={gridItem({ gridArea: "status", justifySelf: { base: "end", lg: "start" } })}
    >
      <Skeleton
        class={css({
          bg: "prim/40",
          rounded: "full",
          blockSize: 6,
          inlineSize: 15,
        })}
      />
    </div>

    <!-- clientname: ~160px -->
    <div class={gridItem({ gridArea: "clientName" })}>
      <Skeleton
        class={css({ bg: "prim/40", aspectRatio: "5/1", inlineSize: 20 })}
      />
    </div>

    <!-- received: right-aligned, ~80px -->
    <div class={gridItem({ gridArea: "received" })}>
      <Skeleton
        class={css({ bg: "prim/40", aspectRatio: "5/1", inlineSize: 20 })}
      />
    </div>

    <!-- balance: right-aligned, ~80px -->
    <div class={gridItem({ gridArea: "balance", justifySelf: "end" })}>
      <Skeleton
        class={css({ bg: "prim/40", aspectRatio: "5/1", inlineSize: 20 })}
      />
    </div>

    <!-- view button: 32px circle, hidden on mobile -->
    <div
      class={gridItem({ gridArea: "view", display: { base: "none", lg: "block" }, placeSelf: "center" })}
    >
      <Skeleton class={circle({ bg: "prim/40", size: 8 })} />
    </div>

    <!-- three dots: 32px circle, hidden on mobile -->
    <div
      class={gridItem({ gridArea: "threeDots", display: { base: "none", lg: "block" }, placeSelf: "center" })}
    >
      <Skeleton class={circle({ bg: "prim/40", size: 8 })} />
    </div>
  </div>
</div>
