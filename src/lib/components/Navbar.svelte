<script lang="ts">
  import { afterNavigate } from "$app/navigation";
  import { asset, resolve } from "$app/paths";
  import { page } from "$app/state";
  import Close from "$lib/components/icons/Close.svelte";
  import Hamburger from "$lib/components/icons/Hamburger.svelte";
  import { Toggle } from "$lib/runes/Toggle.svelte";
  import type { Maybe } from "$lib/types";
  import { isActive } from "$lib/utils/is-active";
  import type { User } from "better-auth";

  type Props = {
    user: Maybe<User>;
  };

  let { user = null }: Props = $props();

  const navItems = $derived(
    user
      ? [
          { href: resolve("/invoices"), title: "Invoices" },
          { href: resolve("/clients"), title: "Clients" },
          { href: resolve("/settings"), title: "Settings" },
          { href: resolve("/logout"), title: "Logout" },
        ]
      : [
          { href: resolve("/"), title: "Home" },
          { href: resolve("/signup"), title: "Signup" },
          { href: resolve("/login"), title: "Login" },
        ]
  );
  const path = $derived(page.url.pathname);

  const nav = new Toggle();
  afterNavigate(nav.off);
</script>

<!-- mobile nav control -->
<button
  class={{
    "fixed inset-e-6 inset-bs-6 z-10 cursor-pointer transition-colors duration-200 md:hidden": true,
    "text-goldenFizz": nav.isOn,
    "text-daisyBush": !nav.isOn,
  }}
  onclick={nav.toggle}
>
  {#if nav.isOn}
    <Close width={32} height={32} />
  {:else}
    <Hamburger width={32} height={32} />
  {/if}
</button>

<header
  class={{
    "bg-daisyBush fixed inset-0 isolate z-2 -translate-x-full overflow-y-auto text-center transition-transform duration-200 inline-full min-block-dvh md:static md:col-span-3 md:translate-x-0 ": true,
    "translate-x-0 ": nav.isOn,
  }}
>
  <div class="my-10 md:mbe-24">
    <a href={resolve("/")}>
      <img
        class="mx-auto"
        src={asset("/images/logo.svg")}
        alt="Doller Holla company logo"
      />
    </a>
  </div>
  <ul class="list-none text-2xl font-medium lg:font-bold">
    {#each navItems as { href, title } (title)}
      {@render listItem(href, title, isActive(href, path))}
    {/each}
  </ul>
</header>

{#snippet listItem(href: string, title: string, isActive: boolean)}
  <li class="not-last:mbe-6">
    <a
      aria-current={isActive}
      {href}
      onclick={nav.off}
      class="hover:text-goldenFizz aria-current:text-robinEggBlue aria-current:hover:text-robinEggBlue supports-linear:before:ease-dramatic supports-linear:after:ease-dramatic relative
     inline-block px-8 text-white transition-colors duration-200 ease-out before:absolute before:inset-s-0 before:inset-bs-0 before:bg-[url('/images/active-nav--left.svg')] before:bg-top-left before:bg-no-repeat
     before:opacity-0 before:transition-[translate,opacity,color] before:duration-200 before:ease-out before:block-7.5 before:inline-5 after:absolute after:inset-e-0 after:inset-bs-0 after:bg-[url('/images/active-nav--right.svg')] after:bg-top-right after:bg-no-repeat
    after:opacity-0
    after:transition-[translate,opacity,color]
     after:duration-200
    after:ease-out after:block-7.5
    after:inline-5 aria-current:before:opacity-100
    aria-current:after:opacity-100
    aria-current:hover:before:-translate-x-1 aria-current:hover:after:translate-x-1"
    >
      {title}
    </a>
  </li>
{/snippet}

<svelte:head>
  {#if nav.isOn}
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
