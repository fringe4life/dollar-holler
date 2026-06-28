<script lang="ts">
  import { css } from "styled-system/css";
  import { clickOutside } from "$lib/client/attachments/clickOutside";
  import type { Toggle } from "$lib/client/runes/Toggle.svelte";
  import ThreeDots from "$lib/components/icons/ThreeDots.svelte";

  interface Props {
    additionalMenu: Toggle;
  }

  let { additionalMenu }: Props = $props();
</script>

<button
  class={css({
    color: { base:"pastelPurple", _groupHover: "daisyBush/50", _hover: "daisyBush" },
    transitionProperty: "colors",
    transitionDuration: "normal",
    cursor: "pointer",
  })}
  onclick={additionalMenu.toggle}
  type="button"
  {@attach additionalMenu.isOn && clickOutside(additionalMenu.off)}
>
  <ThreeDots />
</button>
