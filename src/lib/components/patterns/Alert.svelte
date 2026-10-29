<script lang="ts">
  import { css } from "#styled-system/css/index.js";
  import type { Maybe } from "#lib/types.ts";
  import { CORNER_SHAPE } from "#lib/styles.ts";

  interface Props {
    message: Maybe<string>;
  }
  let { message }: Props = $props();
</script>

{#if message}
  <div
    class={css({
      backgroundColor: "primary",
      color: "primaryForeground",
      cornerShape: CORNER_SHAPE,
      marginBlockEnd: 8,
      minBlockSize: 14,
      p: 4,
      rounded: "lg",
      textAlign: "center",
    })}
  >
    <p>{message}</p>
  </div>
{/if}
