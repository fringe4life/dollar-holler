<script lang="ts">
  import { clickOutside } from "$lib/attachments/clickOutside";
  import { Toggle } from "$lib/attachments/Toggle.svelte";
  import ThreeDots from "$lib/icon/ThreeDots.svelte";

  type Props = {
    additionalMenu: Toggle;
  };

  let { additionalMenu }: Props = $props();
</script>

<button
  {@attach additionalMenu.isOn && clickOutside(additionalMenu.off)}
  onclick={additionalMenu.toggle}
  class="text-pastelPurple hover:text-daisyBush transition-colors duration-200"
  ><ThreeDots /></button
>
