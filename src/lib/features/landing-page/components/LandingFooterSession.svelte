<script lang="ts">
  import type { Snippet } from "svelte";
  import { css } from "#styled-system/css/index.js";
  import { hstack } from "#styled-system/patterns/index.js";
  import { resolve } from "$app/paths";
  import { keepAnonymousLandingFallback } from "#features/landing-page/landing-session.ts";

  interface Props {
    ogygiaFallback?: Snippet;
  }

  let { ogygiaFallback: _ogygiaFallback }: Props = $props();
  keepAnonymousLandingFallback();

  const linkClass = css({
    color: "linkMuted",
    fontSize: "sm",
    fontWeight: "bold",
    textDecoration: "underline",
    textDecorationColor: "primary/40",
    textUnderlineOffset: 4,
    _hover: { color: "primary" },
    _focusVisible: {
      outlineColor: "ring",
      outlineOffset: 3,
      outlineStyle: "solid",
      outlineWidth: 2,
    },
  });

  const footerLinksClass = hstack({
    flexWrap: "wrap",
    gap: { base: 3, md: 5 },
  });
</script>

<nav aria-label="Footer navigation" class={footerLinksClass}>
  <a class={linkClass} href={resolve("invoices")}>Invoices</a>
  <a class={linkClass} href={resolve("clients")}>Clients</a>
</nav>
