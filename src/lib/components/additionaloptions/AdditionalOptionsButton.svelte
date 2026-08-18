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
  })}
  style:anchor-name={anchorName}
  type="button"
  command="toggle-popover"
  commandfor={commandFor}
  aria-label="additional options"
>
  <ThreeDots />
</button>
