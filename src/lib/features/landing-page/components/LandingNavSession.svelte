<script lang="ts">
  import LayoutDashboard from "@lucide/svelte/icons/layout-dashboard";
  import type { Snippet } from "svelte";
  import { css } from "#styled-system/css/index.js";
  import { hstack } from "#styled-system/patterns/index.js";
  import { resolve } from "$app/paths";
  import { keepAnonymousLandingFallback } from "#features/landing-page/landing-session.ts";
  import Button from "#lib/components/primitives/button/button.svelte";

  interface Props {
    ogygiaFallback?: Snippet;
  }

  let { ogygiaFallback: _ogygiaFallback }: Props = $props();
  keepAnonymousLandingFallback();

  const landingActions = hstack({ gap: { base: 2, md: 3 } });

  const landingActionButton = css({
    gap: { base: 1.5, md: 2 },
    minBlockSize: { base: 10, md: "auto" },
    minInlineSize: { base: 10, md: "auto" },
    paddingBlock: { base: 2.5, md: 2 },
    paddingInline: { base: 2.5, md: 5 },
  });

  const landingActionIcon = css({ flexShrink: 0 });

  const landingActionLabel = css({ display: { base: "none", md: "inline" } });
</script>

<div class={landingActions}>
  <Button
    aria-label="Go to dashboard"
    class={landingActionButton}
    href={resolve("invoices")}
    size="default"
  >
    <LayoutDashboard aria-hidden="true" class={landingActionIcon} size={18} />
    <span class={landingActionLabel}>Go to Dashboard</span>
  </Button>
</div>
