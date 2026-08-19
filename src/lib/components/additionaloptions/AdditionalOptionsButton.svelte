<script lang="ts">
  import { css } from "#styled-system/css/index.js";
  import ThreeDots from "#lib/components/icons/ThreeDots.svelte";

  interface Props {
    anchorName: string;
    commandFor: string;
  }

  let { anchorName, commandFor }: Props = $props();
</script>

<button
  class={css({
    color: {
      _groupHover: "daisyBush/50",
      _hover: "daisyBush",
    },
    cursor: "pointer",
    transitionDuration: "normal",
    transitionProperty: "colors",
    "& > svg": {
      rotate: "0deg",
      transitionDuration: "normal",
      transitionProperty: "rotate",
      transitionTimingFunction: {
        base: "anticipate",
        _supportsLinear: "elastic",
      },
    },
    "&:has(+ [popover]:popover-open) > svg": {
      rotate: "90deg",
      _starting: {
        rotate: "0deg",
      },
    },
  })}
  style:anchor-name={anchorName}
  type="button"
  command="toggle-popover"
  commandfor={commandFor}
  aria-label="additional options"
>
  <ThreeDots />
</button>
