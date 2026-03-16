<script lang="ts">
  import { Toggle } from "$lib/attachments/Toggle.svelte";
  import { swipe } from "$lib/attachments/swipe.svelte";
  import Cancel from "$lib/icon/Cancel.svelte";
  import type { Snippet } from "svelte";

  type Props = {
    content: Snippet;
    revealed: Snippet;
    contentClass: string;
  };

  let { content, revealed, contentClass }: Props = $props();
  const swipeReset = new Toggle();
</script>

<div class="relative isolate">
  <!-- CONTENT displayed by default -->
  <div
    {@attach swipe({
      triggerReset: swipeReset.isOn,
      onResetComplete: swipeReset.off,
    })}
    class={contentClass}
  >
    {@render content()}
  </div>
  <!-- REVEALED CONTENT displayed when the user swipes the card -->
  <div
    class="absolute inset-0 z-1 flex h-full w-full items-center justify-around"
  >
    <button onclick={swipeReset.toggle} class="action-button">
      <Cancel width={32} height={32} />
      Cancel
    </button>
    {@render revealed()}
  </div>
</div>

<style>
  @reference "../../app.css";
  :global(.action-button) {
    @apply text-daisyBush flex flex-col items-center justify-center font-bold;
  }
</style>
