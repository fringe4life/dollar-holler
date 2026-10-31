<script lang="ts">
  import { css } from "#styled-system/css/index.js";
  import { asset } from "$app/paths";
  import BlankRow from "./BlankRow.svelte";
  import "#lib/fonts/kalam.css";

  let {
    message = "We didn't find anything that you were looking for.",
  }: {
    message?: string;
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
  style:--arrow-left={`url(${asset("images/arrow-left-up.svg")})`}
>
  <h2
    class={css({
      fontFamily: "handwriting",
      color: "success",
      fontSize: "4xl",
      fontWeight: "bold",
    })}
  >
    Bummer
  </h2>
  <p
    class={css({
      color: "success",
      fontSize: "xl",
      fontWeight: "bold",
    })}
  >
    {message}
  </p>
</div>

<BlankRow />
<BlankRow />
<BlankRow />
<!-- </div> -->
