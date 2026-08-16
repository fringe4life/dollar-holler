<!-- src/lib/components/AuroraBlob.svelte -->
<script lang="ts">
  import { css, cx } from "#styled-system/css/index.js";

  interface Props {
    className: string;
  }
  let { className }: Props = $props();
</script>

<div
  class={cx(
    css({
      pointerEvents: "none",
      position: "absolute",
      blur: "3xl",
      filter: "auto",
      overflow: "hidden",
    }),
    className
  )}
></div>
