<script lang="ts">
  import { css } from "#styled-system/css/index.js";
  import { asset } from "$app/paths";
  import BlankRow from "#features/pagination/components/BlankRow.svelte";
  import "#lib/fonts/kalam.css";

  interface Props {
    message: string;
  }

  let { message }: Props = $props();
</script>

<div
  class={css({
    marginInlineStart: 2,
    marginBlockEnd: 10,
    backgroundImage: { base: "var(--arrow-left)", md: "var(--arrow-right)" },
    backgroundPosition: { base: "left", md: "right" },
    backgroundRepeat: "no-repeat",
    paddingInlineStart: { base: 28, md: 0 },
    paddingInlineEnd: { base: 0, md: 28 },
    paddingBlockStart: 12,
  })}
  style:--arrow-left={`url(${asset("images/arrow-left-up.svg")})`}
  style:--arrow-right={`url(${asset("images/arrow-right-up.svg")})`}
>
  <h2
    class={css({
      fontSize: "3xl",
      fontWeight: "bold",
      textTransform: "capitalize",
      fontFamily: "handwriting",
      color: "success",
      translate: "0 -25%",
    })}
  >
    {message}
  </h2>
</div>

<!-- blank rows -->
<BlankRow />
<BlankRow />
<BlankRow />
