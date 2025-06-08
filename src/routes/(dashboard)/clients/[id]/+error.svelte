<script lang="ts">
  import { page } from '$app/state'
</script>

<svelte:head>
  <title>Not Found! | Doller Holla</title>

  <style>
    body {
      overflow: hidden;
    }
  </style>
</svelte:head>

<div
  class="flex min-h-[calc(100dvh_-_3rem_-_1.75rem)] w-full items-center justify-center bg-[url('/images/bg-error.svg')] bg-center bg-no-repeat"
>
  <div>
    <h1 class="text-daisyBush text-5xl leading-none font-black">Not Found!</h1>
    <p class="text-daisyBush text-center text-lg">{page.error?.message}</p>
  </div>
</div>
