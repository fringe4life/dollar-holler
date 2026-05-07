<script lang="ts">
  import { css } from "styled-system/css";
  import type { Snippet } from "svelte";
  import { asset } from "$app/paths";
  import BlankRow from "./BlankRow.svelte";

  let {
    message = "We didn't find anything that you were looking for.",
    header,
  }: {
    message?: string;
    header: Snippet;
  } = $props();
</script>

<!-- <div> -->
<div
  class={css({
      marginInlineStart: 2,
      marginBlockEnd: 10,
      backgroundImage: "var(--arrow-left)",
      backgroundPosition: "bottom left",
      backgroundRepeat: "no-repeat",
      paddingInlineStart: 28,
      paddingBlockStart: 2,
      
    })}
  style:--arrow-left={`url(${asset('/images/arrow-left-up.svg')})`}
>
  <h2
    class={css({
        fontFamily: "handwriting",
        color: "caribbeanGreen",
        fontSize: "4xl",
        fontWeight: "bold",
      })}
  >
    Bummer
  </h2>
  <p
    class={css({
        color: "caribbeanGreen",
        fontSize: "xl",
        fontWeight: "bold",
      })}
  >
    {message}
  </p>
</div>

{@render header()}

<BlankRow />
<BlankRow />
<BlankRow />
<!-- </div> -->