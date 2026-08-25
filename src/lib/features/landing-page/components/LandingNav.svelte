<script lang="ts">
  import type { User } from "better-auth";
  import { css } from "#styled-system/css/index.js";
  import { between, hstack, square } from "#styled-system/patterns/index.js";
  import { asset, resolve } from "$app/paths";
  import LayoutDashboard from "@lucide/svelte/icons/layout-dashboard";
  import LogIn from "@lucide/svelte/icons/log-in";
  import UserPlus from "@lucide/svelte/icons/user-plus";
  import Button from "#lib/components/primitives/button/button.svelte";
  import type { Maybe } from "#lib/types.ts";

  interface Props {
    user: Maybe<User>;
  }

  let { user = null }: Props = $props();

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
</script>

<nav
  class={css({
    backdropFilter: "auto",
    insetBlockStart: 0,
    insetInline: 0,
    position: "fixed",
    zIndex: "50",
    _notSupportsScroll: {
      backgroundColor: "whisper/95",
      backdropFilter: "xs",
      shadow: "xs",
    },
    _supportsScroll: {
      animationFillMode: "both",
      animationName: "nav-solidify",
      animationRange: "0px 80px",
      animationTimeline: "scroll(root block)",
      animationTimingFunction: "linear",
    },
  })}
>
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
          color: "daisyBush",
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
