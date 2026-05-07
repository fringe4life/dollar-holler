<script lang="ts">
  import { css } from "styled-system/css";
  import Skeleton from "$lib/components/ui/skeleton/skeleton.svelte";
</script>

<div
  class={css({ marginBlockEnd: 6, display: "flex", alignItems: "center", justifyContent: "between", gap: 4 })}
>
  <Skeleton class={css({ blockSize: 10, inlineSize: 20, rounded: "sm" })} />
  <div class={css({ display: "flex", alignItems: "center", gap: 2 })}>
    <Skeleton class={css({ blockSize: 9, rounded: "sm" })} />
    <Skeleton class={css({ blockSize: 9, rounded: "sm" })} />
  </div>
</div>
