<script lang="ts">
  import type { Maybe, SanitizedHTML } from "$lib/types";

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
