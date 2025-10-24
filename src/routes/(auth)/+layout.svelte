<script lang="ts">
  import { asset } from '$app/paths'
  let { children } = $props()
</script>

<div
  class="auth-layout bg-daisyBush min-h-[100dvh] w-full bg-cover bg-center bg-no-repeat"
  style="--bg-auth: url('{asset('/images/bg-auth.svg')}')"
>
  <div class="grid min-h-[100dvh] auto-rows-min grid-cols-12 px-4 md:auto-rows-fr md:gap-5 xl:px-0">
    <div
      class="col-span-full pt-8 md:col-span-6 md:my-auto lg:col-span-4 lg:col-start-3 xl:col-span-3 xl:col-start-4"
    >
      <img src={asset('/images/logo.svg')} alt="The Doller Holla" class="mx-auto" />
    </div>
    <div class="col-span-full md:col-span-6 md:my-auto lg:col-span-4 xl:col-span-3">
      {@render children()}
    </div>
  </div>
</div>

<style>
  .auth-layout {
    background-image: none;
  }
  
  @media (min-width: 768px) {
    .auth-layout {
      background-image: var(--bg-auth);
    }
  }
</style>
