<script lang="ts">
  import MenuIcon from "@lucide/svelte/icons/menu";
  import XIcon from "@lucide/svelte/icons/x";
  import type { User } from "better-auth";
  import { asset, resolve } from "$app/paths";
  import { Button } from "$lib/components/ui/button";
  import { Toggle } from "$lib/runes/Toggle.svelte";
  import type { Maybe } from "$lib/types";

  interface Props {
    user: Maybe<User>;
  }
  let { user = null }: Props = $props();

  let mobileOpen = new Toggle();
</script>

<nav
  class="
    landing-nav not-supports-scroll-timeline:bg-whisper/95 fixed inset-x-0
    inset-bs-0 z-50 not-supports-scroll-timeline:shadow-xs
    not-supports-scroll-timeline:backdrop-blur-xs
  "
>
  <div
    class="mx-auto flex items-center justify-between px-6 py-4 max-inline-6xl"
  >
    <!-- Logo -->
    <a
      href={resolve("/")}
      class="flex items-center gap-2.5"
      onclick={mobileOpen.toggle}
    >
      <img
        src={asset("/images/logo.svg")}
        alt="Dollar Holler"
        class="aspect-square inline-8"
      >
      <span
        class="font-sansserif text-daisyBush text-xl font-black tracking-tight"
      >
        Dollar Holler
      </span>
    </a>

    <!-- Desktop Links -->
    <div class="hidden items-center gap-3 md:flex">
      {#if user}
        <Button href={resolve("/invoices")} variant="default" size="default">
          Go to Dashboard
        </Button>
      {:else}
        <Button href={resolve("/login")} variant="outline" size="default">
          Log in
        </Button>
        <Button href={resolve("/signup")} variant="default" size="default">
          Sign Up Free
        </Button>
      {/if}
    </div>

    <!-- Mobile Hamburger -->
    <button
      class="text-daisyBush flex cursor-pointer items-center md:hidden"
      onclick={mobileOpen.toggle}
      aria-label="Toggle navigation"
      type="button"
    >
      {#if mobileOpen.isOn}
        <XIcon size={26} />
      {:else}
        <MenuIcon size={26} />
      {/if}
    </button>
  </div>

  <!-- Mobile Dropdown -->
  {#if mobileOpen.isOn}
    <div
      class="bg-whisper border-t border-gray-100 px-6 py-4 shadow-lg md:hidden"
    >
      <div class="flex flex-col gap-3">
        {#if user}
          <Button
            href={resolve("/invoices")}
            variant="default"
            onclick={mobileOpen.off}
          >
            Go to Dashboard
          </Button>
        {:else}
          <Button
            href={resolve("/login")}
            variant="outline"
            onclick={mobileOpen.off}
          >
            Log in
          </Button>
          <Button
            href={resolve("/signup")}
            variant="default"
            onclick={mobileOpen.off}
          >
            Sign Up Free
          </Button>
        {/if}
      </div>
    </div>
  {/if}
</nav>
