<script lang="ts">
  import type { Maybe } from "$lib/types";

  type Props = {
    message: Maybe<string>;
  };
  let { message }: Props = $props();
</script>

{#if message}
  <div
    class="mbe-8 rounded-md bg-lavenderIndigo p-4 text-center text-base text-white min-block-14"
  >
    <p>{message}</p>
  </div>
{/if}
