<script lang="ts" module>
  import { sanitize } from "isomorphic-dompurify";
</script>

<script lang="ts">
  let { source }: { source: string } = $props();

  const compiled = $derived.by(() => {
    if (!source) return "";

    try {
      const html = Bun.markdown.html(source);
      return sanitize(html);
    } catch (error) {
      console.error("Error parsing markdown with Bun.markdown:", error);
      return sanitize(source);
    }
  });
</script>

{#if compiled}
  <!-- eslint-disable-next-line svelte/no-at-html-tags -->
  {@html compiled}
{:else}
  <p>Something went wrong, please refresh your page</p>
{/if}
