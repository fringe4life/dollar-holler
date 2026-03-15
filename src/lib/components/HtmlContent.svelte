<script lang="ts">
  import type { Maybe, SanitizedHTML } from "$lib/types";

  type HtmlContentProps = {
    html: Maybe<SanitizedHTML>;
  };
  let { html }: HtmlContentProps = $props();
</script>

{#if html}
  <!-- eslint-disable-next-line svelte/no-at-html-tags -->
  {@html html}
{:else}
  <p>Something went wrong, please refresh your page</p>
{/if}
