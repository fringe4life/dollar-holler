<script lang="ts">
  import { css } from "#styled-system/css/index.js";
  import { CORNER_SHAPE } from "#lib/styles.ts";
</script>

<div
  class={css({
    backgroundColor: "skeletonSubtle/40",
    blockSize: 20,
    borderRadius: "xl",
    cornerShape: CORNER_SHAPE,
    inlineSize: "full",
    marginBlockEnd: 3,
  })}
></div>
