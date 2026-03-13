<script lang="ts">
  let { html }: { html: string } = $props();
</script>

{#if html}
  <!-- eslint-disable-next-line svelte/no-at-html-tags -->
  {@html html}
{:else}
  <p>Something went wrong, please refresh your page</p>
{/if}
