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
  type="button"
  {@attach additionalMenu.isOn && clickOutside(additionalMenu.off)}
  onclick={additionalMenu.toggle}
  class={css({
    color: { base:"pastelPurple", _hover: "daisyBush", _groupHover: "daisyBush/50" },
    transitionProperty: "colors",
    transitionDuration: "normal",
  })}
>
  <ThreeDots />
</button>
