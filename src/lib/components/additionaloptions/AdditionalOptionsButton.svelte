<script lang="ts">
  import { css } from "styled-system/css";
  import ThreeDots from "#lib/components/icons/ThreeDots.svelte";

  interface Props {
    anchorName: string;
    popoverId: string;
  }

  let { anchorName, popoverId }: Props = $props();
</script>

<button
  aria-controls={popoverId}
  aria-haspopup="menu"
  class={css({
    color: {
      _groupHover: "daisyBush/50",
      _hover: "daisyBush",
    },
    cursor: "pointer",
    transitionDuration: "normal",
    transitionProperty: "colors",
  })}
  popovertarget={popoverId}
  style:anchor-name={anchorName}
  type="button"
>
  <ThreeDots />
</button>
