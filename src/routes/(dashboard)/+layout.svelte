<script lang="ts">
  import Navbar from '$lib/components/Navbar.svelte'

  let { children } = $props()
  // import logo from '$assets/logo.svg'
</script>

<div class="bg-whisper grid min-h-[100dvh] grid-cols-12 md:gap-x-16">
  <Navbar />
  <main class="col-span-12 px-4 pt-4 md:col-span-8 md:pt-10">{@render children()}</main>
</div>
