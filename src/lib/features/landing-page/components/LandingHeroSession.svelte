<script lang="ts">
  import type { Snippet } from "svelte";
  import { css } from "#styled-system/css/css.js";
  import { cx } from "#styled-system/css/cx.js";
  import { hstack } from "#styled-system/patterns/index.js";
  import { resolve } from "$app/paths";
  import { keepAnonymousLandingFallback } from "#features/landing-page/landing-session.ts";
  import Button from "#lib/components/primitives/button/button.svelte";
  import ArrowUpRight from "#lib/components/primitives/icons/ArrowUpRight.svelte";

  interface Props {
    ogygiaFallback?: Snippet;
  }

  let { ogygiaFallback: _ogygiaFallback }: Props = $props();
  keepAnonymousLandingFallback();

  /* The glyph owns its push; `directionalArrow` would fight it along X. */
  const arrowClass = css({ flexShrink: 0, height: 4, width: 4 });

  const heroActionsClass = hstack({
    alignItems: "center",
    flexWrap: "wrap",
    gap: { base: 3, md: 4 },
  });

  const primaryButtonClass = css({
    boxShadow: "colored",
    paddingBlock: { base: 2.5, md: 3 },
    paddingInline: { base: 5, md: 6 },
    _hover: { rotate: "-1deg", translate: "0 -2px" },
  });
</script>

<div class={heroActionsClass}>
  <Button
    class={cx("group", primaryButtonClass)}
    href={resolve("invoices")}
    size="lg"
  >
    Go to your invoices
    <ArrowUpRight aria-hidden="true" class={arrowClass} />
  </Button>
</div>
