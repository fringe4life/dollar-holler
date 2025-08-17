<script lang="ts">
  import { marked } from 'marked'
  
  let { source }: { source: string } = $props()
  
  let compiled = $state('')
  
  $effect(() => {
    if (source) {
      const result = marked(source)
      if (typeof result === 'string') {
        compiled = result
      } else {
        result.then((html: string) => {
          compiled = html
        }).catch((error: unknown) => {
          console.error('Error parsing markdown:', error)
          compiled = source // fallback to plain text
        })
      }
    }
  })
</script>

{#if compiled}
  {@html compiled}
{:else}
  <p>{source}</p>
{/if}
