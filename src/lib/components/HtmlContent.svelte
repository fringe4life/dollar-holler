<script lang="ts">
  import type { Maybe } from "$lib/types";

  type HtmlContentProps = {
    html: Maybe<string>;
  };
  let { html }: HtmlContentProps = $props();
</script>

{#if html}
  <!-- eslint-disable-next-line svelte/no-at-html-tags -->
  {@html html}
{:else}
  <p>Something went wrong, please refresh your page</p>
{/if}
