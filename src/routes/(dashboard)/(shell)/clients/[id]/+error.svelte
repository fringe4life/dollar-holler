<script lang="ts">
  import { asset } from "$app/paths";
  import { page } from "$app/state";
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
  class="flex items-center justify-center bg-center bg-no-repeat inline-full min-block-[calc(100dvh-3rem-1.75rem)]"
  style="background-image: url('{asset('/images/bg-error.svg')}')"
>
  <div>
    <h1 class="text-daisyBush text-5xl leading-none font-black">Not Found!</h1>
    <p class="text-daisyBush text-center text-lg">{page.error?.message}</p>
  </div>
</div>
