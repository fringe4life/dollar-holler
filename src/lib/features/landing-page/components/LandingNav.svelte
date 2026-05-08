<script lang="ts">
  import MenuIcon from "@lucide/svelte/icons/menu";
  import XIcon from "@lucide/svelte/icons/x";
  import type { User } from "better-auth";
  import { css } from "styled-system/css";
  import { between, hstack, square } from "styled-system/patterns";
  import { asset, resolve } from "$app/paths";
  import { Toggle } from "$lib/client/runes/Toggle.svelte";
  import Button from "$lib/components/ui/button/button.svelte";
  import type { Maybe } from "$lib/types";

  interface Props {
    user: Maybe<User>;
  }
  let { user = null }: Props = $props();

  let mobileOpen = new Toggle();
</script>

<nav
  class={css({
      position: "fixed",
      insetInline: 0,
      insetBlockStart: 0,
      zIndex: "50",
      backdropFilter: "auto",
      _notSupportsScroll: {
        backgroundColor: "whisper/95",
        shadow: "xs",
        backdropFilter: "xs",
      },
      _supportsScroll: {
        animationName: "nav-solidify",
        animationTimingFunction: "linear",
        animationFillMode: "both",
        animationTimeline: "scroll(root block)",
        animationRange: "0px 80px",
      },
    })}
>
  <div
    class={between({
      marginInline: "auto",
      paddingInline: 6,
      paddingBlock: 4,
      maxInlineSize: "6xl",
    })}
  >
    <!-- Logo -->
    <a
      href={resolve("/")}
      class={hstack({ gap: 2.5 })}
      onclick={mobileOpen.toggle}
    >
      <img
        src={asset('/images/logo.svg')}
        alt="Dollar Holler"
        class={square({ size: 8 })}
      >
      <span
        class={css({
          fontFamily: "sansserif",
          color: "daisyBush",
          fontSize: "xl",
          fontWeight: "black",
          letterSpacing: "tight",
        })}
      >
        Dollar Holler
      </span>
    </a>
    <!-- Desktop Links -->
    <div
      class={css({
        gap: 3,
        alignItems: "center",
        display: { base: "none", md: "flex" },
      })}
    >
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
      class={css({
        color: "daisyBush",
        display: { base: "flex", md: "none" },
        alignItems: "center",
        cursor: "pointer",
      })}
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
      class={css({
        backgroundColor: "whisper",
        borderTopWidth: 1,
        borderColor: "gray.100",
        paddingInline: 6,
        paddingBlock: 4,
        shadow: "lg",
        display: { base: "flex", md: "none" },
      })}
    >
      <div class={hstack({ gap: 3 })}>
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
