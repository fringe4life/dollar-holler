<script lang="ts">
  import { asset, resolve } from "$app/paths";
  import { page } from "$app/state";
  import Close from "$lib/icon/Close.svelte";
  import Hamburger from "$lib/icon/Hamburger.svelte";
  import type { User } from "better-auth";
  import type { MouseEventHandler } from "svelte/elements";

  type Props = {
    user: User | null;
  };

  let { user = null }: Props = $props();

  const navItems = $derived([
    { href: resolve("/invoices"), title: "Invoices" },
    { href: resolve("/clients"), title: "Clients" },
    { href: resolve("/settings"), title: "Settings" },
    user
      ? { href: resolve("/logout"), title: "Logout" }
      : { href: resolve("/login"), title: "Login" },
  ]);
  const path = $derived(page.url.pathname);

  let isNavShowing = $state(false);

  const onclick: MouseEventHandler<HTMLButtonElement> = () => {
    isNavShowing = !isNavShowing;
  };

  // Function to check if a navigation item is active
  const isActive = (href: string): boolean => {
    // Exact match for root paths
    if (href === "/") {
      return path === "/";
    }

    // For other paths, check if current path starts with the href
    // This handles nested routes like /clients/[id] matching /clients
    return path.startsWith(href);
  };
</script>

<!-- mobile nav control -->
<button
  class={{
    "fixed top-6 right-6 z-10 cursor-pointer transition-colors duration-200 md:hidden": true,
    "text-goldenFizz": isNavShowing,
    "text-daisyBush": !isNavShowing,
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
    "  bg-daisyBush fixed inset-0 isolate z-2 w-full -translate-x-full text-center transition-transform duration-200 md:static md:col-span-3 md:translate-x-0 ": true,
    "translate-x-0 ": isNavShowing,
  }}
>
  <div class="mt-10 mb-10 md:mb-24">
    <a href={resolve("/invoices")}>
      <img
        class="mx-auto"
        src={asset("/images/logo.svg")}
        alt="Doller Holla company logo"
      />
    </a>
  </div>
  <ul class="list-none text-2xl font-bold">
    {#each navItems as { href, title } (title)}
      {@render listItem(href, title, isActive(href))}
    {/each}
  </ul>
</header>

{#snippet listItem(href: string, title: string, isActive: boolean)}
  <li class="mb-6">
    <a
      aria-current={isActive}
      {href}
      class="aria-current:text-robinEggBlue hover:text-goldenFizz font-bold text-white transition-[padding] duration-200 ease-out aria-current:px-8 aria-current:[background:url(/images/active-nav--left.svg)_left_top_no-repeat,url(/images/active-nav--right.svg)_right_top_no-repeat] aria-current:hover:px-9"
    >
      {title}
    </a>
  </li>
{/snippet}

<svelte:head>
  {#if isNavShowing}
    <style>
      body {
        overflow: hidden;
        @media screen and (width > 768px) {
          overflow: auto;
        }
      }
    </style>
  {/if}
</svelte:head>
