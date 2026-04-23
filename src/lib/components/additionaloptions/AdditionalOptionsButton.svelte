<script lang="ts">
  import { clickOutside } from "$lib/attachments/clickOutside";
  import ThreeDots from "$lib/components/icons/ThreeDots.svelte";
  import type { Toggle } from "$lib/runes/Toggle.svelte";

  interface Props {
    additionalMenu: Toggle;
  }

  let { additionalMenu }: Props = $props();
</script>

<button
  type="button"
  {@attach additionalMenu.isOn && clickOutside(additionalMenu.off)}
  onclick={additionalMenu.toggle}
  class="text-pastelPurple hover:text-daisyBush group-hover/row:text-daisyBush/50 transition-[color] duration-200"
>
  <ThreeDots />
</button>
