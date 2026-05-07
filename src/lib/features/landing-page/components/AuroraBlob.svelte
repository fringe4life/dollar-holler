<!-- src/lib/components/AuroraBlob.svelte -->
<script lang="ts">
  import { css, cx } from "styled-system/css";
  import { circle } from "styled-system/patterns";
  import type { SystemStyleObject } from "styled-system/types";

  interface Props {
    color: string;
    opacity: string;
    position?: SystemStyleObject;
    size: number;
  }
  let { color, size, opacity, position = {} }: Props = $props();
</script>

<div
  class={cx(circle({ size }), css({ backgroundColor: color, pointerEvents: "none", position: "absolute", filter: "auto", blur: "3xl", opacity, ...position }))}
></div>
