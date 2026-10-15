<script lang="ts">
  import { hstack, square } from "#styled-system/patterns/index.js";
  import Skeleton from "#lib/components/primitives/skeleton/skeleton.svelte";
</script>

<div class={hstack({ gap: 2 })}>
  <Skeleton class={square({ size: 9, rounded: "sm" })} />
  <Skeleton class={square({ size: 9, rounded: "sm" })} />
</div>
