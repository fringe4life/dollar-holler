<script lang="ts">
  import { page } from '$app/state'
  import Close from '$lib/icon/Close.svelte'
  import Hamburger from '$lib/icon/Hamburger.svelte'
  import type { MouseEventHandler } from 'svelte/elements'

  const navItems = [
    { href: '/invoices', title: 'Invoices' },
    { href: '/clients', title: 'Clients' },
    { href: '#', title: 'Settings' },
    { href: '#', title: 'Logout' }
  ]
  const path = $derived(page.url.pathname)

  let isNavShowing = $state(false)

  const onclick: MouseEventHandler<HTMLButtonElement> = () => {
    isNavShowing = !isNavShowing
  }
</script>

<!-- mobile nav control -->
<button
  class={{
    'fixed top-6 right-6 z-10 cursor-pointer transition-colors duration-200 md:hidden': true,
    'text-goldenFizz': isNavShowing,
    'text-daisyBush': !isNavShowing
  }}
  {onclick}
>
  {#if isNavShowing}
    <Close width={32} height={32} />
  {:else}
    <Hamburger width={32} height={32} />
  {/if}
</button>

<header
  class={{
    '  bg-daisyBush  fixed inset-0 -translate-x-full text-center transition-transform duration-200 md:static md:col-span-3 md:translate-x-0 w-full ': true,
    'translate-x-0 ': isNavShowing
  }}
>
  <div class="mt-10 mb-10 md:mb-24">
    <a href="/invoices">
      <img class="mx-auto" src="/images/logo.svg" alt="Doller Holla company logo" />
    </a>
  </div>
  <ul class="list-none text-2xl font-bold">
    {#each navItems as { href, title } (title)}
      {@render listItem(href, title, path === href)}
    {/each}
  </ul>
</header>

{#snippet listItem(href: string, title: string, isActive: boolean)}
  <li class="mb-6">
    <a
      aria-current={isActive}
      {href}
      class="aria-current:text-robinEggBlue hover:text-goldenFizz font-bold text-white transition-[padding] duration-200 ease-out aria-current:px-8 aria-current:[background:url(/images/active-nav--left.svg)_left_top_no-repeat_,_url(/images/active-nav--right.svg)_right_top_no-repeat] aria-current:hover:px-9"
    >
      {title}
    </a>
  </li>
{/snippet}

<svelte:head>
  {#if isNavShowing}
    <style>
      /* @reference '../../app.css'; */
      body {
        overflow: hidden;
        @media screen and (width > 768px) {
          overflow: auto;
        }
      }
      /* body {
        @apply overflow-hidden md:overflow-auto;
      } */
    </style>
  {/if}
</svelte:head>
