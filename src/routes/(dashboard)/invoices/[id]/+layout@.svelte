<script lang="ts">
  import { fly } from 'svelte/transition'
  import Arrow from '$lib/icon/Arrow.svelte'
  import { afterNavigate, goto } from '$app/navigation'
  import { resolve } from '$app/paths'
  let { children } = $props()

  let previousPageLink: string | undefined = $state(undefined)
  
  afterNavigate(navigation => {
    previousPageLink = navigation?.from?.url?.pathname
  })

  // Helper function to get the back navigation URL
  function getBackUrl(): string {
    return previousPageLink || resolve('/invoices')
  }

  // Handle escape key navigation
  function handleEscapeKey() {
    goto(getBackUrl())
  }
</script>

<svelte:window
  onkeydown={e => {
    if (e.key === 'Escape') {
      handleEscapeKey()
    }
  }}
/>

<div
  class="bg-whisper h-full min-h-[100dvh] w-full pt-16 lg:pt-12 lg:pb-32 print:bg-transparent print:py-0"
>
  <main transition:fly={{ y: 500, duration: 200 }} class="mx-auto min-h-[100dvh] max-w-256">
    <a
      href={getBackUrl()}
      class="text-pastelPurple fixed top-7 left-7 print:hidden"><Arrow /></a
    >
    {@render children()}
  </main>
</div>
