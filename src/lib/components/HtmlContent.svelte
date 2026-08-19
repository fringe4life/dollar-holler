<script lang="ts">
  /* eslint-disable svelte/no-at-html-tags -- server-sanitized HTML only */
  import type { Maybe } from "#lib/types.ts";
  import type { SanitizedHTML } from "#lib/schemas/sanitized-html.server.ts";

  interface HtmlContentProps {
    html: Maybe<SanitizedHTML>;
  }
  let { html }: HtmlContentProps = $props();
</script>

{#if html}
  {@html html}
{:else}
  <p>Something went wrong, please refresh your page</p>
{/if}
