<script lang="ts">
  import { asset } from "$app/paths";
  import { page } from "$app/state";
</script>

<svelte:head>
  <title>Not Found! | Doller Holla</title>
</svelte:head>

<div
  class="flex min-h-dvh items-center justify-center bg-center bg-no-repeat inline-full"
  style="background-image: url('{asset('/images/bg-error.svg')}')"
>
  <div>
    <h1 class="text-5xl leading-none font-black text-daisyBush">
      {page.status}
    </h1>
    <p class="text-center text-lg font-bold text-daisyBush">Sorry</p>
    <p class="text-center text-base text-daisyBush">
      We can't find the page you're looking for.
    </p>
  </div>
</div>
