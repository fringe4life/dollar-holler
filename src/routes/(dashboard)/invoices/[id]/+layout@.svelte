<script lang="ts">
  import Arrow from '$lib/icon/Arrow.svelte'
  //   import { navigating, page } from '$app/state'
  import { afterNavigate, goto } from '$app/navigation'
  let { children } = $props()

  let previousPageLink: string | undefined = $state(undefined)
  afterNavigate(navigation => {
    previousPageLink = navigation?.from?.url?.pathname
  })
</script>

<svelte:window
  onkeydown={e => {
    if (e.key === 'Escape') {
      goto(previousPageLink || '/invoices')
    }
  }}
/>

<div
  class="bg-whisper h-full min-h-[100dvh] w-full pt-16 lg:pt-12 lg:pb-32 print:bg-transparent print:py-0"
>
  <main class="mx-auto min-h-[100dvh] max-w-256">
    <a
      href={previousPageLink ? previousPageLink : '/invoices'}
      class="text-pastelPurple fixed top-7 left-7 print:hidden"><Arrow /></a
    >
    {@render children()}
  </main>
</div>
