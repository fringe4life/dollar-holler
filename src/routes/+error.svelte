<script lang="ts">
  import { page } from '$app/state'
  import { asset } from '$app/paths'
</script>

<svelte:head>
  <title>Not Found! | Doller Holla</title>
</svelte:head>

<div
  class="flex min-h-[100dvh] w-full items-center justify-center bg-[url('{asset('/images/bg-error.svg')}')] bg-center bg-no-repeat"
>
  <div>
    <h1 class="text-daisyBush text-5xl leading-none font-black">{page.status}</h1>
    <p class="text-daisyBush text-center text-lg font-bold">Sorry</p>
    <p class="text-daisyBush text-center text-base">We can't find the page you're looking for.</p>
  </div>
</div>
