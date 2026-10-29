<script lang="ts">
  import { ArrowUpRightIcon } from "@lucide/svelte";
  import type { Snippet } from "svelte";
  import { css, cx } from "#styled-system/css/index.js";
  import { hstack } from "#styled-system/patterns/index.js";
  import { resolve } from "$app/paths";
  import { keepAnonymousLandingFallback } from "#features/landing-page/landing-session.ts";
  import Button from "#lib/components/primitives/button/button.svelte";
  import { directionalArrow } from "#lib/styles.ts";

  interface Props {
    ogygiaFallback?: Snippet;
  }

  let { ogygiaFallback: _ogygiaFallback }: Props = $props();
  keepAnonymousLandingFallback();

  const arrowClass = cx(
    css({ flexShrink: 0, height: 4, width: 4 }),
    directionalArrow({ direction: "forward" })
  );

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
    <ArrowUpRightIcon aria-hidden="true" class={arrowClass} />
  </Button>
</div>
