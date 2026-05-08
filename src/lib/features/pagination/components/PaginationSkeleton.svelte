<script lang="ts">
  import { css } from "styled-system/css";
  import { between, flex, hstack, square } from "styled-system/patterns";
  import Skeleton from "$lib/components/ui/skeleton/skeleton.svelte";
</script>

<div class={between({ marginBlockEnd: 6, gap: 4 })}>
  <Skeleton
    class={css({ aspectRatio: "2/1", inlineSize: 20, rounded: "sm" })}
  />
  <div class={hstack({ gap: 2 })}>
    <Skeleton class={square({ size: 9, rounded: "sm" })} />
    <Skeleton class={square({ size: 9, rounded: "sm" })} />
  </div>
</div>
