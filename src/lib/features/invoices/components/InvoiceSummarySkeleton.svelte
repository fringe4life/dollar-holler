<script lang="ts">
  import { css } from "#styled-system/css/index.js";
  import Skeleton from "#lib/components/primitives/skeleton/skeleton.svelte";
</script>

<div
  aria-hidden="true"
  class={css({
    alignItems: "center",
    blockSize: "66px",
    display: "flex",
    flexDirection: "column",
    gap: 1,
    justifyContent: "center",
  })}
>
  <Skeleton
    class={css({
      bg: "prim/40",
      blockSize: 4,
      inlineSize: "70%",
      maxInlineSize: "9rem",
    })}
  />
  <Skeleton
    class={css({
      bg: "prim/40",
      blockSize: 9,
      inlineSize: "50%",
      maxInlineSize: "7rem",
    })}
  />
</div>
