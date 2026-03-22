<script lang="ts">
  import { asset } from "$app/paths";
  let { children } = $props();
</script>

<div
  class="bg-daisyBush bg-none bg-cover bg-center bg-no-repeat inline-full min-block-dvh md:bg-[url('/images/bg-auth.svg')]"
>
  <div
    class="grid min-h-dvh auto-rows-min grid-cols-12 place-content-center px-4 md:auto-rows-fr md:gap-5 xl:px-0"
  >
    <div
      class="col-span-full pbs-8 md:col-span-6 md:my-auto lg:col-span-4 lg:col-start-3 xl:col-span-3 xl:col-start-4"
    >
      <img
        src={asset("/images/logo.svg")}
        alt="The Doller Holla"
        class="mx-auto"
      />
    </div>
    <div
      class="col-span-full md:col-span-6 md:my-auto lg:col-span-4 xl:col-span-3"
    >
      {@render children()}
    </div>
  </div>
</div>
