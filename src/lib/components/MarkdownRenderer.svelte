<script lang="ts" module>
  import { marked } from 'marked'
  import DOMPurify from 'isomorphic-dompurify'

  // Configure marked globally to sanitize HTML using DOMPurify postprocess hook
  // This is the official recommended approach per marked documentation
  marked.use({
    hooks: {
      postprocess(html) {
        return DOMPurify.sanitize(html)
      },
    },
  })
</script>

<script lang="ts">
  let { source }: { source: string } = $props()

  let compiled = $state('')

  $effect(() => {
    if (source) {
      const result = marked(source)
      if (typeof result === 'string') {
        compiled = result
      } else {
        result
          .then((html: string) => {
            compiled = html
          })
          .catch((error: unknown) => {
            console.error('Error parsing markdown:', error)
            compiled = DOMPurify.sanitize(source) // fallback to sanitized plain text
          })
      }
    }
  })
</script>

{#if compiled}
  <!-- eslint-disable-next-line svelte/no-at-html-tags -->
  {@html compiled}
{:else}
  <p>{source}</p>
{/if}
