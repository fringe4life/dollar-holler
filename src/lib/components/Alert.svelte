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
      marginBlockEnd: 8,
      rounded: "md",
      p: 4,
      textAlign: "center",
      color: "white",
      minBlockSize: 14,
    })}
  >
    <p>{message}</p>
  </div>
{/if}
