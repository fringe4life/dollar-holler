<script lang="ts">
  import { css } from "#styled-system/css/index.js";
  import { between, hstack, square } from "#styled-system/patterns/index.js";
  import Skeleton from "#lib/components/ui/skeleton/skeleton.svelte";
</script>

<div
  aria-label="Loading pagination controls"
  aria-live="polite"
  class={between({ marginBlockEnd: 6, gap: 4 })}
  role="status"
>
  <Skeleton
    class={css({ aspectRatio: "2/1", inlineSize: 20, rounded: "sm" })}
  />
  <div class={hstack({ gap: 2 })}>
    <Skeleton class={square({ size: 9, rounded: "sm" })} />
    <Skeleton class={square({ size: 9, rounded: "sm" })} />
  </div>
</div>
