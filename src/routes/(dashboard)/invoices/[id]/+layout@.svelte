<script lang="ts">
  import { fly } from 'svelte/transition'
  import Arrow from '$lib/icon/Arrow.svelte'
  //   import { navigating, page } from '$app/state'
  import { afterNavigate, goto } from '$app/navigation'
  import { resolve } from '$app/paths'
  let { children } = $props()

  let previousPageLink: string | undefined = $state(undefined)
  afterNavigate(navigation => {
    previousPageLink = navigation?.from?.url?.pathname
  })
</script>

<svelte:window
  onkeydown={e => {
    if (e.key === 'Escape') {
      goto(resolve(previousPageLink || '/invoices'))
    }
  }}
/>

<div
  class="bg-whisper h-full min-h-[100dvh] w-full pt-16 lg:pt-12 lg:pb-32 print:bg-transparent print:py-0"
>
  <main transition:fly={{ y: 500, duration: 200 }} class="mx-auto min-h-[100dvh] max-w-256">
    <a
      href={resolve(previousPageLink || '/invoices')}
      class="text-pastelPurple fixed top-7 left-7 print:hidden"><Arrow /></a
    >
    {@render children()}
  </main>
</div>
