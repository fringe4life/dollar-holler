<!-- src/lib/components/AuroraBlob.svelte -->
<script lang="ts">
  import { css, cx } from "styled-system/css";
  import { circle } from "styled-system/patterns";

  interface Props {
    className: string;
  }
  let { className }: Props = $props();
</script>

<div
  class={cx(css({  pointerEvents: "none", position: "absolute", blur: "3xl", filter: "auto" }), className)}
></div>
