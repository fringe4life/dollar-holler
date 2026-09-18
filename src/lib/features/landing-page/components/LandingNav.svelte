<script lang="ts">
  import type { User } from "better-auth";
  import { css, keyframes } from "#styled-system/css/index.js";
  import { between, hstack, square } from "#styled-system/patterns/index.js";
  import { asset, resolve } from "$app/paths";
  import LayoutDashboard from "@lucide/svelte/icons/layout-dashboard";
  import LogIn from "@lucide/svelte/icons/log-in";
  import UserPlus from "@lucide/svelte/icons/user-plus";
  import Button from "#lib/components/primitives/button/button.svelte";
  import ModeSelect from "#lib/components/patterns/ModeSelect.svelte";
  import type { Maybe } from "#lib/types.ts";

  interface Props {
    user: Maybe<User>;
  }

  let { user = null }: Props = $props();

  const navSolidify = keyframes({
    from: {
      backdropFilter: "blur(0)",
      backgroundColor: "transparent",
      boxShadow: "0 0 0 oklch(from var(--colors-black) l c h / 0%)",
    },
    to: {
      backdropFilter: "blur(4px)",
      backgroundColor: "oklch(from var(--colors-background) l c h / 95%)",
      boxShadow: "0 1px 3px oklch(from var(--colors-black) l c h / 10%)",
    },
  });

  const landingNav = css({
    backdropFilter: "auto",
    insetBlockStart: 0,
    insetInline: 0,
    position: "fixed",
    zIndex: "50",
    _notSupportsScroll: {
      backgroundColor: "background/95",
      backdropFilter: "xs",
      shadow: "xs",
    },
    _supportsScroll: {
      animationFillMode: "both",
      animationName: navSolidify,
      animationRange: "0px 80px",
      animationTimeline: "scroll()",
      animationTimingFunction: "linear",
    },
  });

  const landingActions = hstack({
    gap: { base: 2, md: 3 },
  });

  const landingActionButton = css({
    gap: { base: 1.5, md: 2 },
    minBlockSize: { base: 10, md: "auto" },
    minInlineSize: { base: 10, md: "auto" },
    paddingBlock: { base: 2.5, md: 2 },
    paddingInline: { base: 2.5, md: 5 },
  });

  const landingActionIcon = css({
    flexShrink: 0,
  });

  const landingActionLabel = css({
    display: { base: "none", md: "inline" },
  });

  const landingModeSelect = css({
    color: "foreground",
    inlineSize: { base: 24, md: 32 },
  });
</script>

<nav class={landingNav}>
  <div
    class={between({
      marginInline: "auto",
      maxInlineSize: "6xl",
      paddingBlock: 4,
      paddingInline: 6,
    })}
  >
    <!-- Logo -->
    <a class={hstack({ gap: 2.5 })} href={resolve("/")}>
      <img
        alt="Dollar Holler"
        class={square({ size: 8 })}
        src={asset("images/logo.svg")}
      />
      <span
        class={css({
          color: "foreground",
          fontFamily: "sansserif",
          fontSize: "xl",
          fontWeight: "black",
          letterSpacing: "tight",
        })}
      >
        Dollar Holler
      </span>
    </a>
    <!-- Responsive actions -->
    <div class={landingActions}>
      <div class={landingModeSelect}>
        <ModeSelect />
      </div>
      {#if user}
        <Button
          aria-label="Go to dashboard"
          class={landingActionButton}
          href={resolve("invoices")}
          size="default"
          variant="default"
        >
          <LayoutDashboard
            aria-hidden="true"
            class={landingActionIcon}
            size={18}
          />
          <span class={landingActionLabel}>Go to Dashboard</span>
        </Button>
      {:else}
        <Button
          aria-label="Log in"
          class={landingActionButton}
          href={resolve("login")}
          size="default"
          variant="outline"
        >
          <LogIn aria-hidden="true" class={landingActionIcon} size={18} />
          <span class={landingActionLabel}>Log in</span>
        </Button>
        <Button
          aria-label="Sign up free"
          class={landingActionButton}
          href={resolve("signup")}
          size="default"
          variant="default"
        >
          <UserPlus aria-hidden="true" class={landingActionIcon} size={18} />
          <span class={landingActionLabel}>Sign Up Free</span>
        </Button>
      {/if}
    </div>
  </div>
</nav>
