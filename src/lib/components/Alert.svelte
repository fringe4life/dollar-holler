<script lang="ts">
  import { css } from "styled-system/css";
  import type { Maybe } from "$lib/types";

  interface Props {
    message: Maybe<string>;
  }
  let { message }: Props = $props();
</script>

{#if message}
  <div
    class={css({
      backgroundColor: "lavenderIndigo",
      color: "white",
      marginBlockEnd: 8,
      minBlockSize: 14,
      p: 4,
      rounded: "md",
      textAlign: "center",
    })}
  >
    <p>{message}</p>
  </div>
{/if}
