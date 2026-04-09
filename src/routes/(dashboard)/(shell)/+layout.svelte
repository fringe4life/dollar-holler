<script lang="ts">
  import Navbar from "$lib/components/Navbar.svelte";

  let { children, data } = $props();
</script>

<div
  class="bg-whisper grid grid-cols-12 overflow-x-clip min-block-dvh md:gap-x-16"
>
  <Navbar user={data.user} />
  <main
    class="relative col-span-12 flex flex-col px-4 pbs-4 min-block-dvh md:col-span-8 md:pbs-10"
  >
    {@render children()}
  </main>
</div>
