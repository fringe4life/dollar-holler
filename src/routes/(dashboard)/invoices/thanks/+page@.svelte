<script>
  import { asset } from '$app/paths'
</script>

<svelte:head>
  <title>Thank You! | Doller Holla</title>
</svelte:head>

<div
  class="flex min-h-[100dvh] w-full items-center justify-center bg-center bg-no-repeat"
  style="background-image: url('{asset('/images/bg-thankYou.svg')}')"
>
  <div>
    <h1 class="text-daisyBush text-5xl leading-none font-black">Thank You!</h1>
    <p class="text-daisyBush text-lg">Your payment has been received!</p>
  </div>
</div>
